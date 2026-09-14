from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
import uuid

def generate_id():
    return str(uuid.uuid4())

class UserBase(SQLModel):
    name: str
    email: str
    role: str = "STAFF"
    active: bool = True
    passwordHash: str

class User(UserBase, table=True):
    __tablename__ = "User"
    id: str = Field(default_factory=generate_id, primary_key=True)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    invoices: List["Invoice"] = Relationship(back_populates="createdBy")
    payments: List["Payment"] = Relationship(back_populates="user")
    audits: List["AuditLog"] = Relationship(back_populates="user")

class Customer(SQLModel, table=True):
    __tablename__ = "Customer"
    id: str = Field(default_factory=generate_id, primary_key=True)
    name: str = Field(index=True)
    phone: Optional[str] = Field(default=None, index=True)
    email: Optional[str] = None
    address: Optional[str] = None
    gstin: Optional[str] = None
    customerType: str = "RETAIL"
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    invoices: List["Invoice"] = Relationship(back_populates="customer")

class Category(SQLModel, table=True):
    __tablename__ = "Category"
    id: str = Field(default_factory=generate_id, primary_key=True)
    name: str = Field(unique=True)
    active: bool = True

    products: List["ProductOrService"] = Relationship(back_populates="category")

class ProductOrService(SQLModel, table=True):
    __tablename__ = "ProductOrService"
    id: str = Field(default_factory=generate_id, primary_key=True)
    name: str = Field(index=True)
    sku: Optional[str] = Field(default=None, unique=True, index=True)
    description: Optional[str] = None
    itemType: str = Field(default="PRODUCT", index=True)
    unit: str
    hsnCode: Optional[str] = None
    mrp: Decimal
    sellingPrice: Decimal
    costPrice: Optional[Decimal] = None
    gstEnabled: bool = True
    gstRate: Decimal
    priceEntryMode: str = "INCLUDES_GST"
    inventoryTracked: bool = False
    stockQuantity: Decimal = Decimal(0)
    minimumStockLevel: Decimal = Decimal(0)
    active: bool = True
    notes: Optional[str] = None
    categoryId: Optional[str] = Field(default=None, foreign_key="Category.id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    category: Optional[Category] = Relationship(back_populates="products")
    invoiceItems: List["InvoiceItem"] = Relationship(back_populates="product")

class Invoice(SQLModel, table=True):
    __tablename__ = "Invoice"
    id: str = Field(default_factory=generate_id, primary_key=True)
    invoiceNumber: str = Field(unique=True)
    invoiceDate: datetime = Field(default_factory=datetime.utcnow, index=True)
    customerId: Optional[str] = Field(default=None, foreign_key="Customer.id")
    customerName: str
    customerPhone: Optional[str] = None
    customerGstin: Optional[str] = None
    customerAddress: Optional[str] = None
    businessName: str
    businessGstin: str
    businessAddress: Optional[str] = None
    businessPhone: Optional[str] = None
    businessEmail: Optional[str] = None
    taxSplitMode: str = "INTRA_STATE"
    subtotal: Decimal
    totalDiscount: Decimal
    totalTaxableValue: Decimal
    totalCgst: Decimal
    totalSgst: Decimal
    totalIgst: Decimal
    totalGst: Decimal
    roundOff: Decimal = Decimal(0)
    grandTotal: Decimal
    amountPaid: Decimal = Decimal(0)
    balanceDue: Decimal
    status: str = Field(default="FINALIZED", index=True)
    paymentStatus: str = Field(default="UNPAID", index=True)
    notes: Optional[str] = None
    createdById: str = Field(foreign_key="User.id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    cancelledAt: Optional[datetime] = None
    
    customer: Optional[Customer] = Relationship(back_populates="invoices")
    createdBy: User = Relationship(back_populates="invoices")
    items: List["InvoiceItem"] = Relationship(back_populates="invoice")
    payments: List["Payment"] = Relationship(back_populates="invoice")

class InvoiceItem(SQLModel, table=True):
    __tablename__ = "InvoiceItem"
    id: str = Field(default_factory=generate_id, primary_key=True)
    invoiceId: str = Field(foreign_key="Invoice.id")
    productId: Optional[str] = Field(default=None, foreign_key="ProductOrService.id")
    serialNo: int
    itemNameSnapshot: str
    description: str
    skuSnapshot: Optional[str] = None
    hsnCodeSnapshot: Optional[str] = None
    unitSnapshot: str
    itemTypeSnapshot: str = "PRODUCT"
    mrp: Decimal
    enteredPrice: Decimal
    priceEntryMode: str = "INCLUDES_GST"
    quantity: Decimal
    discountType: str = "NONE"
    discountValue: Decimal
    discountAmount: Decimal
    taxableValue: Decimal
    gstRate: Decimal
    cgst: Decimal
    sgst: Decimal
    igst: Decimal
    totalGst: Decimal
    lineTotal: Decimal
    
    invoice: Invoice = Relationship(back_populates="items")
    product: Optional[ProductOrService] = Relationship(back_populates="invoiceItems")

class Payment(SQLModel, table=True):
    __tablename__ = "Payment"
    id: str = Field(default_factory=generate_id, primary_key=True)
    invoiceId: str = Field(foreign_key="Invoice.id")
    userId: str = Field(foreign_key="User.id")
    method: str = "CASH"
    amount: Decimal
    reference: Optional[str] = None
    notes: Optional[str] = None
    paidAt: datetime = Field(default_factory=datetime.utcnow, index=True)
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    invoice: Invoice = Relationship(back_populates="payments")
    user: User = Relationship(back_populates="payments")

class AuditLog(SQLModel, table=True):
    __tablename__ = "AuditLog"
    id: str = Field(default_factory=generate_id, primary_key=True)
    userId: Optional[str] = Field(default=None, foreign_key="User.id")
    action: str
    entity: str = Field(index=True)
    entityId: Optional[str] = Field(default=None, index=True)
    before: Optional[str] = None
    after: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow, index=True)

    user: Optional[User] = Relationship(back_populates="audits")
