// Global Application State
const state = {
    currentView: 'dashboard',
    products: [],
    cart: [],
    customers: [],
    invoices: []
};

// API configuration
const API_URL = '/api'; // Relative because FastAPI serves both frontend and backend

async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const res = await fetch(`${API_URL}${endpoint}`, options);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return await res.json();
    } catch (err) {
        showToast(err.message, 'error');
        console.error(err);
        return null;
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Router
const views = {
    dashboard: renderDashboard,
    billing: renderBilling,
    invoices: renderInvoices,
    products: renderProducts,
    customers: renderCustomers,
    payments: renderPayments
};

function handleRoute() {
    let hash = window.location.hash.replace('#', '') || 'dashboard';
    
    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === `#${hash}`) {
            a.classList.add('active');
        }
    });

    const container = document.getElementById('view-container');
    container.innerHTML = '<div class="loader"></div>';
    
    if (views[hash]) {
        state.currentView = hash;
        views[hash](container);
    } else {
        container.innerHTML = '<h1>404 - Page Not Found</h1>';
    }
}

// Initialization
window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', () => {
    handleRoute();
});

// ==========================================
// VIEWS
// ==========================================

// --- DASHBOARD ---
async function renderDashboard(container) {
    const invoices = await apiCall('/invoices?limit=100') || [];
    
    const totalRevenue = invoices.reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);
    const totalInvoices = invoices.length;
    
    const html = `
        <h1>Dashboard</h1>
        <div class="grid grid-cols-4">
            <div class="card stat-card">
                <div class="stat-icon blue"><i class="fas fa-rupee-sign"></i></div>
                <div class="stat-info">
                    <h3>Total Revenue</h3>
                    <p>₹${parseFloat(totalRevenue).toFixed(2)}</p>
                </div>
            </div>
            <div class="card stat-card">
                <div class="stat-icon green"><i class="fas fa-file-invoice"></i></div>
                <div class="stat-info">
                    <h3>Invoices Generated</h3>
                    <p>${totalInvoices}</p>
                </div>
            </div>
            <div class="card stat-card">
                <div class="stat-icon orange"><i class="fas fa-users"></i></div>
                <div class="stat-info">
                    <h3>Customers</h3>
                    <p>-</p>
                </div>
            </div>
        </div>
        
        <div class="card" style="margin-top: 24px;">
            <div class="card-header">
                <h2 class="card-title">Recent Invoices</h2>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Invoice #</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoices.slice(0, 5).map(inv => `
                            <tr>
                                <td>${inv.invoiceNumber}</td>
                                <td>${new Date(inv.invoiceDate).toLocaleDateString()}</td>
                                <td>${inv.customerName || 'Walk-in'}</td>
                                <td>₹${parseFloat(inv.grandTotal).toFixed(2)}</td>
                                <td><span class="badge ${inv.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}">${inv.paymentStatus || 'UNPAID'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

// --- PRODUCTS ---
async function renderProducts(container) {
    const products = await apiCall('/products?limit=100') || [];
    
    const html = `
        <div class="card-header">
            <h1>Products & Services</h1>
            <button class="btn btn-primary" onclick="alert('Add feature coming soon')"><i class="fas fa-plus"></i> Add Product</button>
        </div>
        <div class="card">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>SKU/HSN</th>
                            <th>Selling Price</th>
                            <th>GST</th>
                            <th>Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => `
                            <tr>
                                <td>${p.name}</td>
                                <td>${p.sku || '-'}<br><small style="color:var(--text-secondary)">${p.hsnCode || ''}</small></td>
                                <td>₹${parseFloat(p.sellingPrice).toFixed(2)}</td>
                                <td>${p.gstEnabled ? p.gstRate + '%' : 'None'}</td>
                                <td>${p.inventoryTracked ? p.stockQuantity : 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

// --- CUSTOMERS ---
async function renderCustomers(container) {
    const customers = await apiCall('/customers?limit=100') || [];
    
    const html = `
        <div class="card-header">
            <h1>Customers</h1>
            <button class="btn btn-primary" onclick="alert('Add feature coming soon')"><i class="fas fa-plus"></i> Add Customer</button>
        </div>
        <div class="card">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>GSTIN</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.map(c => `
                            <tr>
                                <td>${c.name}</td>
                                <td>${c.phone || '-'}</td>
                                <td>${c.email || '-'}</td>
                                <td>${c.gstin || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

// --- INVOICES ---
async function renderInvoices(container) {
    const invoices = await apiCall('/invoices?limit=100') || [];
    
    const html = `
        <div class="card-header">
            <h1>Invoices</h1>
            <a href="#billing" class="btn btn-primary"><i class="fas fa-plus"></i> Create Invoice</a>
        </div>
        <div class="card">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Invoice #</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoices.map(inv => `
                            <tr>
                                <td>${inv.invoiceNumber}</td>
                                <td>${new Date(inv.invoiceDate).toLocaleDateString()}</td>
                                <td>${inv.customerName || 'Walk-in'}</td>
                                <td>₹${parseFloat(inv.grandTotal).toFixed(2)}</td>
                                <td><span class="badge ${inv.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}">${inv.paymentStatus || 'UNPAID'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

// --- PAYMENTS ---
async function renderPayments(container) {
    const payments = await apiCall('/payments?limit=100') || [];
    
    const html = `
        <div class="card-header">
            <h1>Payments</h1>
        </div>
        <div class="card">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Method</th>
                            <th>Amount</th>
                            <th>Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.map(p => `
                            <tr>
                                <td>${new Date(p.paidAt).toLocaleString()}</td>
                                <td><span class="badge badge-success">${p.method}</span></td>
                                <td>₹${parseFloat(p.amount).toFixed(2)}</td>
                                <td>${p.reference || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

// --- BILLING (POS ENGINE) ---
async function renderBilling(container) {
    state.products = await apiCall('/products?limit=100') || [];
    state.cart = []; // Reset cart on load
    
    window.addToCart = (productId) => {
        const prod = state.products.find(p => p.id === productId);
        if (!prod) return;
        
        const existing = state.cart.find(i => i.product.id === productId);
        if (existing) {
            existing.quantity += 1;
        } else {
            state.cart.push({ 
                product: prod, 
                quantity: 1,
                unitPrice: parseFloat(prod.sellingPrice) || 0,
                gstRate: parseFloat(prod.gstRate) || 0,
                priceEntryMode: prod.priceEntryMode || "EXCLUDES_GST"
            });
        }
        updateCartUI();
    };
    
    window.updateQty = (productId, delta) => {
        const item = state.cart.find(i => i.product.id === productId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                state.cart = state.cart.filter(i => i.product.id !== productId);
            }
            updateCartUI();
        }
    };
    
    window.updateCartItem = (productId, field, value) => {
        const item = state.cart.find(i => i.product.id === productId);
        if (item) {
            if (field === 'unitPrice' || field === 'gstRate') {
                item[field] = parseFloat(value) || 0;
            } else {
                item[field] = value;
            }
            updateCartUI();
        }
    };
    
    window.processSale = async () => {
        if (state.cart.length === 0) {
            showToast('Cart is empty', 'error');
            return;
        }
        
        let subtotal = 0;
        let totalGst = 0;
        
        const items = state.cart.map(item => {
            const p = item.product;
            const price = item.unitPrice;
            const qty = item.quantity;
            let itemTotal = price * qty;
            
            let taxAmt = 0;
            let baseValue = itemTotal;
            
            if (p.gstEnabled) {
                if (item.priceEntryMode === "INCLUDES_GST") {
                    baseValue = itemTotal / (1 + (item.gstRate / 100));
                    taxAmt = itemTotal - baseValue;
                } else {
                    taxAmt = itemTotal * (item.gstRate / 100);
                    itemTotal = itemTotal + taxAmt;
                }
                totalGst += taxAmt;
            }
            subtotal += baseValue;
            
            return {
                description: p.name,
                quantity: qty,
                unitPrice: price,
                total: itemTotal,
                taxRate: p.gstEnabled ? item.gstRate : 0,
                taxAmount: taxAmt
            };
        });
        
        const grandTotal = subtotal + totalGst;
        
        const payload = {
            invoiceNumber: "ARSH-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
            invoiceDate: new Date().toISOString(),
            customerName: "Walk-in Customer",
            subtotal: subtotal,
            totalGst: totalGst,
            totalCgst: totalGst / 2,
            totalSgst: totalGst / 2,
            grandTotal: grandTotal,
            paymentStatus: "PAID",
            items: items
        };
        
        const res = await apiCall('/invoices', 'POST', payload);
        if (res) {
            showToast('Sale Completed Successfully!');
            state.cart = [];
            updateCartUI();
            
            await apiCall('/payments', 'POST', {
                invoiceId: res.id,
                amount: grandTotal,
                method: "CASH",
                paidAt: new Date().toISOString()
            });
        }
    };
    
    const html = `
        <h1>Point of Sale</h1>
        <div class="pos-layout">
            <!-- Product Grid -->
            <div class="card">
                <div class="form-group">
                    <input type="text" class="form-control" placeholder="Search products...">
                </div>
                <div class="product-grid">
                    ${state.products.map(p => `
                        <div class="product-card" onclick="addToCart('${p.id}')">
                            <div class="product-name">${p.name}</div>
                            <div class="product-price">₹${parseFloat(p.sellingPrice).toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Cart Area -->
            <div class="card" style="display:flex; flex-direction:column;">
                <h2>Current Sale</h2>
                <div id="cart-items" style="flex:1; overflow-y:auto;">
                    <!-- Cart items injected here -->
                    <div style="text-align:center; color:var(--text-secondary); margin-top:20px;">Cart is empty</div>
                </div>
                <div id="cart-summary">
                    <!-- Summary injected here -->
                </div>
                <button class="btn btn-primary" style="width:100%; margin-top:16px; padding:16px; font-size:1.1rem;" onclick="processSale()">
                    Complete Sale
                </button>
            </div>
        </div>
    `;
    container.innerHTML = html;
    
    window.updateCartUI = () => {
        const cartItemsDiv = document.getElementById('cart-items');
        const summaryDiv = document.getElementById('cart-summary');
        
        if (state.cart.length === 0) {
            cartItemsDiv.innerHTML = '<div style="text-align:center; color:var(--text-secondary); margin-top:20px;">Cart is empty</div>';
            summaryDiv.innerHTML = '';
            return;
        }
        
        let subtotal = 0;
        let totalTax = 0;
        
        cartItemsDiv.innerHTML = state.cart.map(item => {
            const p = item.product;
            const price = item.unitPrice;
            const qty = item.quantity;
            let itemTotal = price * qty;
            
            let taxAmt = 0;
            let baseValue = itemTotal;
            
            if (p.gstEnabled) {
                if (item.priceEntryMode === "INCLUDES_GST") {
                    baseValue = itemTotal / (1 + (item.gstRate / 100));
                    taxAmt = itemTotal - baseValue;
                } else {
                    taxAmt = itemTotal * (item.gstRate / 100);
                    itemTotal = itemTotal + taxAmt;
                }
                totalTax += taxAmt;
            }
            subtotal += baseValue;
            
            return `
                <div class="cart-item" style="flex-direction:column; align-items:stretch; gap:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="font-weight:500; color:white;">${p.name}</div>
                        <div style="font-weight:600; color:white;">₹${itemTotal.toFixed(2)}</div>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <div class="cart-qty-controls">
                            <button class="cart-qty-btn" onclick="updateQty('${p.id}', -1)"><i class="fas fa-minus"></i></button>
                            <span style="width:24px; text-align:center; font-weight:600;">${item.quantity}</span>
                            <button class="cart-qty-btn" onclick="updateQty('${p.id}', 1)"><i class="fas fa-plus"></i></button>
                        </div>
                        <input type="number" value="${item.unitPrice}" step="0.01" class="form-control" style="width:80px; padding:4px;" onchange="updateCartItem('${p.id}', 'unitPrice', this.value)" title="Unit Price">
                        ${p.gstEnabled ? `
                        <input type="number" value="${item.gstRate}" step="0.1" class="form-control" style="width:60px; padding:4px;" onchange="updateCartItem('${p.id}', 'gstRate', this.value)" title="GST %">
                        <select class="form-control" style="width:auto; padding:4px;" onchange="updateCartItem('${p.id}', 'priceEntryMode', this.value)" title="GST Mode">
                            <option value="EXCLUDES_GST" ${item.priceEntryMode === 'EXCLUDES_GST' ? 'selected' : ''}>+ GST</option>
                            <option value="INCLUDES_GST" ${item.priceEntryMode === 'INCLUDES_GST' ? 'selected' : ''}>Inc. GST</option>
                        </select>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        summaryDiv.innerHTML = `
            <div class="cart-totals">
                <div class="cart-row">
                    <span>Base Subtotal</span>
                    <span>₹${subtotal.toFixed(2)}</span>
                </div>
                <div class="cart-row">
                    <span>Total GST</span>
                    <span>₹${totalTax.toFixed(2)}</span>
                </div>
                <div class="cart-row grand-total">
                    <span>Grand Total</span>
                    <span>₹${(subtotal + totalTax).toFixed(2)}</span>
                </div>
            </div>
        `;
    };
    
    // Initial UI render
    updateCartUI();
}
