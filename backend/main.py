from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, SQLModel, create_engine, select, func
from sqlalchemy.pool import NullPool
from typing import List, Dict, Any
try:
    from backend.models import Invoice, ProductOrService, Customer, Payment, InvoiceItem, User
except ImportError:
    from models import Invoice, ProductOrService, Customer, Payment, InvoiceItem, User
from pydantic import BaseModel
import random
from datetime import datetime

sqlite_file_name = "dev.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args, poolclass=NullPool)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(title="ARSH Enterprises Billing API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_session():
    with Session(engine) as session:
        yield session

class InvoiceItemCreate(BaseModel):
    name: str
    mrp: float
    enteredPrice: float
    quantity: float
    gstRate: float
    priceEntryMode: str
    discountType: str
    discountValue: float

class PaymentCreate(BaseModel):
    amount: float
    method: str = "CASH"

class InvoiceCreate(BaseModel):
    items: List[InvoiceItemCreate]
    customerName: str
    payments: List[PaymentCreate]
    taxSplitMode: str
    totals: Dict[str, Any]

@app.get("/api/reports/invoices-agg")
def get_invoices_agg(session: Session = Depends(get_session)):
    result = session.query(
        func.sum(Invoice.grandTotal).label("grandTotal"),
        func.sum(Invoice.totalGst).label("totalGst"),
        func.sum(Invoice.totalDiscount).label("totalDiscount")
    ).first()
    return {"_sum": {"grandTotal": float(result.grandTotal or 0), "totalGst": float(result.totalGst or 0), "totalDiscount": float(result.totalDiscount or 0)}}

@app.get("/api/reports/refunds-agg")
def get_refunds_agg(session: Session = Depends(get_session)):
    # Assuming Refund is not in models, returning 0
    return {"_sum": {"amount": 0}}

@app.get("/api/invoices", response_model=List[Invoice])
def read_invoices(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    return session.exec(select(Invoice).order_by(Invoice.invoiceDate.desc()).offset(skip).limit(limit)).all()

@app.get("/api/invoices/{invoice_id}")
def read_invoice(invoice_id: str, session: Session = Depends(get_session)):
    invoice = session.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {
        **invoice.dict(),
        "items": [item.dict() for item in invoice.items],
        "payments": [payment.dict() for payment in invoice.payments]
    }

@app.post("/api/invoices")
def create_invoice(payload: InvoiceCreate, session: Session = Depends(get_session)):
    admin_user = session.exec(select(User).limit(1)).first()
    user_id = admin_user.id if admin_user else "admin"

    inv_number = f"ARSH-{datetime.now().year}-{random.randint(1000, 9999)}"
    
    invoice = Invoice(
        invoiceNumber=inv_number,
        customerName=payload.customerName or "Walk-in",
        businessName="ARSH ENTERPRISES",
        businessGstin="29AIGPR1899C1ZU",
        taxSplitMode=payload.taxSplitMode,
        subtotal=payload.totals.get("subtotal", 0),
        totalDiscount=payload.totals.get("totalDiscount", 0),
        totalTaxableValue=payload.totals.get("totalTaxableValue", 0),
        totalCgst=payload.totals.get("totalCgst", 0),
        totalSgst=payload.totals.get("totalSgst", 0),
        totalIgst=payload.totals.get("totalIgst", 0),
        totalGst=payload.totals.get("totalGst", 0),
        grandTotal=payload.totals.get("grandTotal", 0),
        balanceDue=payload.totals.get("balanceDue", 0),
        createdById=user_id
    )
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    
    for idx, item in enumerate(payload.items):
        line = payload.totals.get("lines", [])[idx] if idx < len(payload.totals.get("lines", [])) else {}
        db_item = InvoiceItem(
            invoiceId=invoice.id,
            serialNo=idx + 1,
            itemNameSnapshot=item.name,
            description=item.name,
            unitSnapshot="NOS",
            mrp=item.mrp,
            enteredPrice=item.enteredPrice,
            priceEntryMode=item.priceEntryMode,
            quantity=item.quantity,
            discountType=item.discountType,
            discountValue=item.discountValue,
            discountAmount=line.get("discountAmount", 0),
            taxableValue=line.get("taxableValue", 0),
            gstRate=item.gstRate,
            cgst=line.get("cgst", 0),
            sgst=line.get("sgst", 0),
            igst=line.get("igst", 0),
            totalGst=line.get("totalGst", 0),
            lineTotal=line.get("lineTotal", 0)
        )
        session.add(db_item)
        
    for p in payload.payments:
        db_payment = Payment(
            invoiceId=invoice.id,
            userId=user_id,
            method=p.method,
            amount=p.amount
        )
        session.add(db_payment)
        
    session.commit()
    return invoice

@app.get("/api/products", response_model=List[ProductOrService])
def read_products(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    return session.exec(select(ProductOrService).offset(skip).limit(limit)).all()

@app.post("/api/products", response_model=ProductOrService)
def create_product(product: ProductOrService, session: Session = Depends(get_session)):
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@app.get("/api/customers", response_model=List[Customer])
def read_customers(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    return session.exec(select(Customer).offset(skip).limit(limit)).all()

@app.get("/api/payments", response_model=List[Payment])
def read_payments(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    return session.exec(select(Payment).order_by(Payment.paidAt.desc()).offset(skip).limit(limit)).all()

from fastapi.staticfiles import StaticFiles
import sys
import os

if getattr(sys, 'frozen', False):
    base_dir = sys._MEIPASS
else:
    base_dir = os.path.join(os.path.dirname(__file__), '..')

out_dir = os.path.join(base_dir, 'out')
if os.path.exists(out_dir):
    app.mount('/', StaticFiles(directory=out_dir, html=True), name='static')

if __name__ == '__main__':
    import uvicorn
    import threading
    import time
    import webbrowser

    def open_browser():
        time.sleep(1.5)
        webbrowser.open('http://localhost:8000/')

    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run(app, host='127.0.0.1', port=8000)
