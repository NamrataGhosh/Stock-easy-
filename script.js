
// Data Storage
let medicines = [];
let sales = [];
let customers = [];
let users = [];
let draftBill = [];
let currentUser = null;
let isEditingProfile = false;

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveToLocalStorage() {
    localStorage.setItem('stockEasy_medicines', JSON.stringify(medicines));
    localStorage.setItem('stockEasy_sales', JSON.stringify(sales));
    localStorage.setItem('stockEasy_customers', JSON.stringify(customers));
    localStorage.setItem('stockEasy_users', JSON.stringify(users));
    localStorage.setItem('stockEasy_currentUser', JSON.stringify(currentUser));
}

function loadFromLocalStorage() {
    medicines = JSON.parse(localStorage.getItem('stockEasy_medicines') || '[]');
    sales = JSON.parse(localStorage.getItem('stockEasy_sales') || '[]');
    customers = JSON.parse(localStorage.getItem('stockEasy_customers') || '[]');
    users = JSON.parse(localStorage.getItem('stockEasy_users') || '[]');
    currentUser = JSON.parse(localStorage.getItem('stockEasy_currentUser') || 'null');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<strong>${type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Warning!'}</strong> ${message}`;
    
    document.getElementById('toast-container').appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });
    document.getElementById(pageId).style.display = 'block';
    document.getElementById(pageId).classList.add('active');
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Modal Management
function showAuthModal(formType) {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('active');
    switchAuthForm(formType);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function switchAuthForm(formType) {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(`${formType}-form`).classList.add('active');
}

// Authentication Functions
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;
    
    // Find user in users array
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = { ...user, role };
        saveToLocalStorage();
        closeModal('auth-modal');
        
        if (role === 'admin') {
            showPage('admin-page');
            initializeAdmin();
        } else {
            showPage('dashboard-page');
            initializeDashboard();
        }
        
        showToast('Login successful!');
    } else {
        showToast('Invalid credentials. Please try again.', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const formData = {
        id: generateId(),
        firstName: document.getElementById('reg-firstname').value,
        middleName: document.getElementById('reg-middlename').value,
        lastName: document.getElementById('reg-lastname').value,
        businessName: document.getElementById('reg-business').value,
        country: document.getElementById('reg-country').value,
        state: document.getElementById('reg-state').value,
        city: document.getElementById('reg-city').value,
        pinCode: document.getElementById('reg-pin').value,
        streetAddress: document.getElementById('reg-street').value,
        email: document.getElementById('reg-email').value,
        phone: document.getElementById('reg-phone').value,
        altPhone: document.getElementById('reg-alt-phone').value,
        gstNumber: document.getElementById('reg-gst').value,
        aadhaarNumber: document.getElementById('reg-aadhaar').value,
        panNumber: document.getElementById('reg-pan').value,
        drugLicense: document.getElementById('reg-drug-license').value,
        password: document.getElementById('reg-password').value,
        confirmPassword: document.getElementById('reg-confirm-password').value,
        joinDate: new Date().toISOString(),
        subscription: 'pro',
        status: 'active'
    };
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
    }
    
    // Check if email already exists
    if (users.some(user => user.email === formData.email)) {
        showToast('Email already registered!', 'error');
        return;
    }
    
    users.push(formData);
    saveToLocalStorage();
    
    showToast('Registration successful! Please login.');
    switchAuthForm('login');
    
    // Clear form
    event.target.reset();
}

function handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const newPassword = document.getElementById('forgot-new-password').value;
    const confirmPassword = document.getElementById('forgot-confirm-password').value;
    
    if (newPassword !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
    }
    
    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        saveToLocalStorage();
        showToast('Password reset successful! Please login with your new password.');
        switchAuthForm('login');
    } else {
        showToast('Email not found!', 'error');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('stockEasy_currentUser');
    showPage('landing-page');
    showToast('Logged out successfully!');
}

// Dashboard Initialization
function initializeDashboard() {
    if (!currentUser) return;
    
    document.getElementById('user-name').textContent = currentUser.firstName + ' ' + currentUser.lastName;
    loadProfileData();
    updateMedicinesTable();
    updateCustomersTable();
    updateSalesTable();
    updateReports();
    
    // Set up sidebar navigation
    document.querySelectorAll('.sidebar .nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchDashboardSection(section);
        });
    });
}

function initializeAdmin() {
    document.getElementById('admin-name').textContent = 'Administrator';
    updateAdminDashboard();
    updateAdminUsersTable();
    
    // Set up admin sidebar navigation
    document.querySelectorAll('#admin-page .sidebar .nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchAdminSection(section);
        });
    });
}

function switchDashboardSection(sectionName) {
    // Update sidebar active state
    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Update page title
    const titles = {
        profile: 'Profile',
        stock: 'Stock Management',
        customers: 'Customers & Billing',
        reports: 'Reports & Analytics',
        sales: 'Sales History',
        payment: 'Subscription'
    };
    document.getElementById('page-title').textContent = titles[sectionName] || 'Dashboard';
}

function switchAdminSection(sectionName) {
    // Update sidebar active state
    document.querySelectorAll('#admin-page .sidebar .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`#admin-page [data-section="${sectionName}"]`).classList.add('active');
    
    // Update content sections
    document.querySelectorAll('#admin-page .content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Update page title
    const titles = {
        'admin-dashboard': 'Dashboard',
        'admin-users': 'User Management',
        'admin-profile': 'Admin Profile'
    };
    document.getElementById('admin-page-title').textContent = titles[sectionName] || 'Dashboard';
}

// Profile Management
function loadProfileData() {
    if (!currentUser) return;
    
    document.getElementById('profile-name').textContent = `${currentUser.firstName} ${currentUser.middleName || ''} ${currentUser.lastName}`.trim();
    document.getElementById('profile-business').textContent = currentUser.businessName || '-';
    document.getElementById('profile-email').textContent = currentUser.email || '-';
    document.getElementById('profile-phone').textContent = currentUser.phone || '-';
    document.getElementById('profile-address').textContent = `${currentUser.streetAddress}, ${currentUser.city}, ${currentUser.state}, ${currentUser.country} - ${currentUser.pinCode}`;
    document.getElementById('profile-gst').textContent = currentUser.gstNumber || '-';
}

function toggleProfileEdit() {
    isEditingProfile = !isEditingProfile;
    
    const spans = document.querySelectorAll('.detail-item span');
    const inputs = document.querySelectorAll('.detail-item input, .detail-item textarea');
    const actions = document.getElementById('profile-actions');
    
    if (isEditingProfile) {
        // Populate edit fields
        document.getElementById('edit-name').value = `${currentUser.firstName} ${currentUser.middleName || ''} ${currentUser.lastName}`.trim();
        document.getElementById('edit-business').value = currentUser.businessName || '';
        document.getElementById('edit-email').value = currentUser.email || '';
        document.getElementById('edit-phone').value = currentUser.phone || '';
        document.getElementById('edit-address').value = `${currentUser.streetAddress}, ${currentUser.city}, ${currentUser.state}, ${currentUser.country} - ${currentUser.pinCode}`;
        document.getElementById('edit-gst').value = currentUser.gstNumber || '';
        
        // Show inputs, hide spans
        spans.forEach(span => span.style.display = 'none');
        inputs.forEach(input => input.style.display = 'block');
        actions.style.display = 'flex';
    } else {
        // Show spans, hide inputs
        spans.forEach(span => span.style.display = 'block');
        inputs.forEach(input => input.style.display = 'none');
        actions.style.display = 'none';
    }
}

function saveProfile() {
    const updatedData = {
        ...currentUser,
        firstName: document.getElementById('edit-name').value.split(' ')[0],
        lastName: document.getElementById('edit-name').value.split(' ').slice(-1)[0],
        businessName: document.getElementById('edit-business').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        gstNumber: document.getElementById('edit-gst').value
    };
    
    // Update current user
    currentUser = updatedData;
    
    // Update in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = updatedData;
    }
    
    saveToLocalStorage();
    loadProfileData();
    toggleProfileEdit();
    showToast('Profile updated successfully!');
}

function cancelProfileEdit() {
    toggleProfileEdit();
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // In a real app, you'd upload to a server
            showToast('Profile photo updated!');
        };
        reader.readAsDataURL(file);
    }
}

// Stock Management
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function addMedicineRecord(event) {
    event.preventDefault();
    
    const medicine = {
        id: generateId(),
        batchNo: document.getElementById('batch-no').value,
        name: document.getElementById('medicine-name').value,
        manufacturer: document.getElementById('manufacturer').value,
        category: document.getElementById('category').value,
        mfgDate: document.getElementById('mfg-date').value,
        expiryDate: document.getElementById('expiry-date').value,
        buyingDate: document.getElementById('buying-date').value,
        entryDate: document.getElementById('entry-date').value,
        mrp: parseFloat(document.getElementById('mrp').value),
        discount: parseFloat(document.getElementById('discount').value || 0),
        quantity: parseInt(document.getElementById('quantity').value),
        type: document.getElementById('type').value,
        sellerId: document.getElementById('seller-id').value,
        sellerName: document.getElementById('seller-name').value,
        addedBy: currentUser.id,
        dateAdded: new Date().toISOString()
    };
    
    medicines.push(medicine);
    saveToLocalStorage();
    updateMedicinesTable();
    showToast('Medicine record added successfully!');
    
    // Clear form
    event.target.reset();
}

function updateMedicinesTable() {
    const tbody = document.getElementById('medicines-tbody');
    
    if (medicines.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="9">No medicines added yet. Use the "Add Record" tab to get started.</td></tr>';
        return;
    }
    
    tbody.innerHTML = medicines.map(medicine => {
        const expiryDate = new Date(medicine.expiryDate);
        const today = new Date();
        const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        let expiryClass = '';
        if (daysToExpiry < 0) {
            expiryClass = 'expiry-danger';
        } else if (daysToExpiry <= 30) {
            expiryClass = 'expiry-warning';
        }
        
        return `
            <tr class="${expiryClass}">
                <td>${medicine.batchNo}</td>
                <td>${medicine.name}</td>
                <td>${medicine.manufacturer}</td>
                <td>${new Date(medicine.expiryDate).toLocaleDateString()}</td>
                <td>${medicine.quantity}</td>
                <td>₹${medicine.mrp.toFixed(2)}</td>
                <td>${medicine.discount}%</td>
                <td>${medicine.type}</td>
                <td>
                    <button class="action-btn edit" onclick="editMedicine('${medicine.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteMedicine('${medicine.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function editMedicine(medicineId) {
    const medicine = medicines.find(m => m.id === medicineId);
    if (!medicine) return;
    
    // Populate edit form
    document.getElementById('edit-medicine-id').value = medicine.id;
    document.getElementById('edit-batch-no').value = medicine.batchNo;
    document.getElementById('edit-medicine-name').value = medicine.name;
    document.getElementById('edit-manufacturer').value = medicine.manufacturer;
    document.getElementById('edit-quantity').value = medicine.quantity;
    document.getElementById('edit-mrp').value = medicine.mrp;
    document.getElementById('edit-discount').value = medicine.discount;
    
    // Show modal
    document.getElementById('edit-medicine-modal').classList.add('active');
}

function updateMedicineRecord(event) {
    event.preventDefault();
    
    const medicineId = document.getElementById('edit-medicine-id').value;
    const medicineIndex = medicines.findIndex(m => m.id === medicineId);
    
    if (medicineIndex !== -1) {
        medicines[medicineIndex] = {
            ...medicines[medicineIndex],
            batchNo: document.getElementById('edit-batch-no').value,
            name: document.getElementById('edit-medicine-name').value,
            manufacturer: document.getElementById('edit-manufacturer').value,
            quantity: parseInt(document.getElementById('edit-quantity').value),
            mrp: parseFloat(document.getElementById('edit-mrp').value),
            discount: parseFloat(document.getElementById('edit-discount').value)
        };
        
        saveToLocalStorage();
        updateMedicinesTable();
        closeModal('edit-medicine-modal');
        showToast('Medicine record updated successfully!');
    }
}

function deleteMedicine(medicineId) {
    if (confirm('Are you sure you want to delete this medicine record?')) {
        medicines = medicines.filter(m => m.id !== medicineId);
        saveToLocalStorage();
        updateMedicinesTable();
        showToast('Medicine record deleted successfully!');
    }
}

function filterMedicines() {
    const searchTerm = document.getElementById('medicine-search').value.toLowerCase();
    const filteredMedicines = medicines.filter(medicine => 
        medicine.name.toLowerCase().includes(searchTerm) ||
        medicine.manufacturer.toLowerCase().includes(searchTerm) ||
        medicine.batchNo.toLowerCase().includes(searchTerm)
    );
    
    displayFilteredMedicines(filteredMedicines);
}

function sortMedicines() {
    const sortBy = document.getElementById('sort-by').value;
    let sortedMedicines = [...medicines];
    
    switch (sortBy) {
        case 'name':
            sortedMedicines.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'expiry':
            sortedMedicines.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
            break;
        case 'entry':
            sortedMedicines.sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
            break;
        case 'quantity':
            sortedMedicines.sort((a, b) => b.quantity - a.quantity);
            break;
    }
    
    displayFilteredMedicines(sortedMedicines);
}

function displayFilteredMedicines(medicineList) {
    const tbody = document.getElementById('medicines-tbody');
    
    if (medicineList.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="9">No medicines found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = medicineList.map(medicine => {
        const expiryDate = new Date(medicine.expiryDate);
        const today = new Date();
        const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        let expiryClass = '';
        if (daysToExpiry < 0) {
            expiryClass = 'expiry-danger';
        } else if (daysToExpiry <= 30) {
            expiryClass = 'expiry-warning';
        }
        
        return `
            <tr class="${expiryClass}">
                <td>${medicine.batchNo}</td>
                <td>${medicine.name}</td>
                <td>${medicine.manufacturer}</td>
                <td>${new Date(medicine.expiryDate).toLocaleDateString()}</td>
                <td>${medicine.quantity}</td>
                <td>₹${medicine.mrp.toFixed(2)}</td>
                <td>${medicine.discount}%</td>
                <td>${medicine.type}</td>
                <td>
                    <button class="action-btn edit" onclick="editMedicine('${medicine.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteMedicine('${medicine.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Sales Management
function showMedicineSuggestions(query) {
    const suggestions = document.getElementById('medicine-suggestions');
    
    if (query.length < 2) {
        suggestions.style.display = 'none';
        return;
    }
    
    const matches = medicines.filter(medicine => 
        medicine.name.toLowerCase().includes(query.toLowerCase()) && 
        medicine.quantity > 0
    );
    
    if (matches.length === 0) {
        suggestions.style.display = 'none';
        return;
    }
    
    suggestions.innerHTML = matches.map(medicine => 
        `<div class="suggestion-item" onclick="selectMedicine('${medicine.id}')">
            ${medicine.name} - ${medicine.manufacturer} (Qty: ${medicine.quantity})
        </div>`
    ).join('');
    
    suggestions.style.display = 'block';
}

function selectMedicine(medicineId) {
    const medicine = medicines.find(m => m.id === medicineId);
    if (!medicine) return;
    
    // Sort by expiry date (earliest first)
    const sameMedicines = medicines.filter(m => 
        m.name === medicine.name && 
        m.manufacturer === medicine.manufacturer && 
        m.quantity > 0
    ).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    
    if (sameMedicines.length > 0) {
        const selectedMedicine = sameMedicines[0]; // Use earliest expiry
        
        document.getElementById('sell-medicine').value = selectedMedicine.name;
        document.getElementById('sell-manufacturer').value = selectedMedicine.manufacturer;
        document.getElementById('sell-batch').value = selectedMedicine.batchNo;
        document.getElementById('available-qty').value = selectedMedicine.quantity;
        document.getElementById('sell-qty').max = selectedMedicine.quantity;
        
        const finalPrice = selectedMedicine.mrp * (1 - selectedMedicine.discount / 100);
        document.getElementById('unit-price').value = finalPrice.toFixed(2);
    }
    
    document.getElementById('medicine-suggestions').style.display = 'none';
}

function addToSale(event) {
    event.preventDefault();
    
    const medicineName = document.getElementById('sell-medicine').value;
    const manufacturer = document.getElementById('sell-manufacturer').value;
    const batchNo = document.getElementById('sell-batch').value;
    const sellQty = parseInt(document.getElementById('sell-qty').value);
    const unitPrice = parseFloat(document.getElementById('unit-price').value);
    const dealerName = document.getElementById('dealer-name').value;
    
    // Find the medicine
    const medicine = medicines.find(m => 
        m.name === medicineName && 
        m.manufacturer === manufacturer && 
        m.batchNo === batchNo
    );
    
    if (!medicine) {
        showToast('Medicine not found!', 'error');
        return;
    }
    
    if (sellQty > medicine.quantity) {
        showToast('Insufficient stock!', 'error');
        return;
    }
    
    // Add to draft bill
    const draftItem = {
        id: generateId(),
        medicineId: medicine.id,
        medicineName,
        manufacturer,
        batchNo,
        quantity: sellQty,
        unitPrice,
        lineTotal: sellQty * unitPrice,
        dealerName
    };
    
    draftBill.push(draftItem);
    updateDraftBillTable();
    
    // Clear form
    event.target.reset();
    showToast('Item added to cart!');
}

function updateDraftBillTable() {
    const tbody = document.getElementById('draft-bill-tbody');
    const totalElement = document.getElementById('bill-total');
    const confirmBtn = document.getElementById('confirm-sale-btn');
    
    if (draftBill.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No items in cart</td></tr>';
        totalElement.textContent = '0.00';
        confirmBtn.disabled = true;
        return;
    }
    
    tbody.innerHTML = draftBill.map(item => `
        <tr>
            <td>${item.medicineName}</td>
            <td>${item.batchNo}</td>
            <td>${item.quantity}</td>
            <td>₹${item.unitPrice.toFixed(2)}</td>
            <td>₹${item.lineTotal.toFixed(2)}</td>
            <td>
                <button class="action-btn delete" onclick="removeFromDraft('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    const total = draftBill.reduce((sum, item) => sum + item.lineTotal, 0);
    totalElement.textContent = total.toFixed(2);
    confirmBtn.disabled = false;
}

function removeFromDraft(itemId) {
    draftBill = draftBill.filter(item => item.id !== itemId);
    updateDraftBillTable();
    showToast('Item removed from cart!');
}

function clearDraftBill() {
    draftBill = [];
    updateDraftBillTable();
    showToast('Cart cleared!');
}

function confirmSale() {
    if (draftBill.length === 0) {
        showToast('No items in cart!', 'error');
        return;
    }
    
    // Show customer modal
    document.getElementById('customer-modal').classList.add('active');
}

function completeCustomerSale(event) {
    event.preventDefault();
    
    const customerData = {
        name: document.getElementById('customer-name').value,
        phone: document.getElementById('customer-phone').value,
        email: document.getElementById('customer-email').value,
        address: document.getElementById('customer-address').value
    };
    
    // Create sale record
    const sale = {
        id: generateId(),
        date: new Date().toISOString(),
        customer: customerData,
        items: [...draftBill],
        totalAmount: draftBill.reduce((sum, item) => sum + item.lineTotal, 0),
        soldBy: currentUser.id
    };
    
    // Update stock quantities
    draftBill.forEach(item => {
        const medicineIndex = medicines.findIndex(m => m.id === item.medicineId);
        if (medicineIndex !== -1) {
            medicines[medicineIndex].quantity -= item.quantity;
        }
    });
    
    // Save sale and customer
    sales.push(sale);
    
    // Add customer if not exists
    const existingCustomer = customers.find(c => c.phone === customerData.phone);
    if (!existingCustomer) {
        customers.push({
            id: generateId(),
            ...customerData,
            firstPurchase: sale.date,
            totalPurchases: sale.totalAmount
        });
    } else {
        existingCustomer.totalPurchases += sale.totalAmount;
    }
    
    // Clear draft and update tables
    draftBill = [];
    saveToLocalStorage();
    updateDraftBillTable();
    updateMedicinesTable();
    updateCustomersTable();
    updateSalesTable();
    updateReports();
    
    closeModal('customer-modal');
    event.target.reset();
    showToast('Sale completed successfully!');
}

// Customer & Billing Management
function updateCustomersTable() {
    const tbody = document.getElementById('customers-tbody');
    
    if (sales.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No sales recorded yet. Complete a sale to see customer records.</td></tr>';
        return;
    }
    
    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.customer.name}</td>
            <td>${sale.customer.phone}<br>${sale.customer.email || ''}</td>
            <td>${sale.items.length}</td>
            <td>${sale.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
            <td>₹${sale.totalAmount.toFixed(2)}</td>
            <td>
                <button class="action-btn edit" onclick="viewSaleDetails('${sale.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function viewSaleDetails(saleId) {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;
    
    alert(`Sale Details:\n\nCustomer: ${sale.customer.name}\nItems: ${sale.items.length}\nTotal: ₹${sale.totalAmount.toFixed(2)}\nDate: ${new Date(sale.date).toLocaleDateString()}`);
}

// Reports & Analytics
function updateReports() {
    // Calculate metrics
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const medicinesSold = sales.reduce((sum, sale) => sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    
    // Calculate expired items
    const today = new Date();
    const expiredItems = medicines.filter(medicine => new Date(medicine.expiryDate) < today).length;
    const estimatedLoss = medicines
        .filter(medicine => new Date(medicine.expiryDate) < today)
        .reduce((sum, medicine) => sum + (medicine.mrp * medicine.quantity), 0);
    
    // Update metric displays
    document.getElementById('total-revenue').textContent = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById('medicines-sold').textContent = medicinesSold.toString();
    document.getElementById('expired-items').textContent = expiredItems.toString();
    document.getElementById('estimated-loss').textContent = `₹${estimatedLoss.toFixed(2)}`;
    
    // Update charts
    updateSalesChart();
    updateMedicinesChart();
}

function updateSalesChart() {
    const ctx = document.getElementById('sales-chart');
    if (!ctx) return;
    
    // Group sales by month
    const salesByMonth = {};
    sales.forEach(sale => {
        const month = new Date(sale.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        salesByMonth[month] = (salesByMonth[month] || 0) + sale.totalAmount;
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(salesByMonth),
            datasets: [{
                label: 'Sales Revenue',
                data: Object.values(salesByMonth),
                borderColor: '#2563EB',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateMedicinesChart() {
    const ctx = document.getElementById('medicines-chart');
    if (!ctx) return;
    
    // Get top selling medicines
    const medicineSales = {};
    sales.forEach(sale => {
        sale.items.forEach(item => {
            medicineSales[item.medicineName] = (medicineSales[item.medicineName] || 0) + item.quantity;
        });
    });
    
    const topMedicines = Object.entries(medicineSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: topMedicines.map(([name]) => name),
            datasets: [{
                data: topMedicines.map(([,quantity]) => quantity),
                backgroundColor: [
                    '#2563EB',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Sales History Management
function updateSalesTable() {
    const tbody = document.getElementById('sales-tbody');
    
    if (sales.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No sales recorded yet. Complete your first sale to see history.</td></tr>';
        return;
    }
    
    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.customer.name}</td>
            <td>${sale.customer.email || '-'}</td>
            <td>${sale.customer.phone}</td>
            <td>${sale.items.length}</td>
            <td>₹${sale.totalAmount.toFixed(2)}</td>
            <td>
                <button class="action-btn edit" onclick="viewSaleDetails('${sale.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterSales() {
    const filter = document.getElementById('sales-filter').value;
    const customRange = document.getElementById('custom-date-range');
    
    if (filter === 'custom') {
        customRange.style.display = 'flex';
    } else {
        customRange.style.display = 'none';
        applySalesFilter(filter);
    }
}

function applySalesFilter(filter) {
    let filteredSales = [...sales];
    const now = new Date();
    
    switch (filter) {
        case '6months':
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            filteredSales = sales.filter(sale => new Date(sale.date) >= sixMonthsAgo);
            break;
        case '3months':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            filteredSales = sales.filter(sale => new Date(sale.date) >= threeMonthsAgo);
            break;
        case 'month':
            filteredSales = sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
            });
            break;
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filteredSales = sales.filter(sale => new Date(sale.date) >= weekAgo);
            break;
    }
    
    displayFilteredSales(filteredSales);
}

function applyCustomFilter() {
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(document.getElementById('end-date').value);
    
    const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
    });
    
    displayFilteredSales(filteredSales);
}

function displayFilteredSales(salesList) {
    const tbody = document.getElementById('sales-tbody');
    
    if (salesList.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No sales found for the selected period.</td></tr>';
        return;
    }
    
    tbody.innerHTML = salesList.map(sale => `
        <tr>
            <td>${new Date(sale.date).toLocaleDateString()}</td>
            <td>${sale.customer.name}</td>
            <td>${sale.customer.email || '-'}</td>
            <td>${sale.customer.phone}</td>
            <td>${sale.items.length}</td>
            <td>₹${sale.totalAmount.toFixed(2)}</td>
            <td>
                <button class="action-btn edit" onclick="viewSaleDetails('${sale.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Subscription Management
function updateSubscription(plan) {
    if (!currentUser) return;
    
    currentUser.subscription = plan;
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].subscription = plan;
    }
    
    saveToLocalStorage();
    showToast(`Subscription updated to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`);
    
    // Update UI to reflect new plan
    updateSubscriptionUI();
}

function updateSubscriptionUI() {
    // This would update the subscription cards to show current plan
    // Implementation depends on specific UI requirements
}

// Admin Functions
function updateAdminDashboard() {
    // Calculate admin metrics
    const totalUsers = users.length;
    const subscribedUsers = users.filter(u => u.subscription && u.subscription !== 'free').length;
    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    document.getElementById('total-users').textContent = totalUsers.toString();
    document.getElementById('subscribed-users').textContent = subscribedUsers.toString();
    document.getElementById('admin-total-sales').textContent = `₹${totalSales.toFixed(2)}`;
    
    // Update admin charts
    updateUserGrowthChart();
    updateSubscriptionChart();
}

function updateAdminUsersTable() {
    const tbody = document.getElementById('admin-users-tbody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="8">No users registered yet.</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.businessName}</td>
            <td>${user.phone}</td>
            <td>${user.subscription || 'Free'}</td>
            <td>${new Date(user.joinDate).toLocaleDateString()}</td>
            <td>
                <span class="status-${user.status === 'active' ? 'active' : 'inactive'}">
                    ${user.status || 'Active'}
                </span>
            </td>
            <td>
                <button class="action-btn edit" onclick="viewUserDetails('${user.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn delete" onclick="toggleUserStatus('${user.id}')">
                    <i class="fas fa-${user.status === 'active' ? 'ban' : 'check'}"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function viewUserDetails(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    alert(`User Details:\n\nName: ${user.firstName} ${user.lastName}\nBusiness: ${user.businessName}\nEmail: ${user.email}\nPhone: ${user.phone}\nSubscription: ${user.subscription || 'Free'}\nJoin Date: ${new Date(user.joinDate).toLocaleDateString()}`);
}

function toggleUserStatus(userId) {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].status = users[userIndex].status === 'active' ? 'inactive' : 'active';
        saveToLocalStorage();
        updateAdminUsersTable();
        showToast(`User status updated!`);
    }
}

function updateUserGrowthChart() {
    const ctx = document.getElementById('user-growth-chart');
    if (!ctx) return;
    
    // Group users by month
    const usersByMonth = {};
    users.forEach(user => {
        const month = new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        usersByMonth[month] = (usersByMonth[month] || 0) + 1;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(usersByMonth),
            datasets: [{
                label: 'New Users',
                data: Object.values(usersByMonth),
                backgroundColor: '#10B981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function updateSubscriptionChart() {
    const ctx = document.getElementById('subscription-chart');
    if (!ctx) return;
    
    // Group by subscription type
    const subscriptions = {};
    users.forEach(user => {
        const plan = user.subscription || 'free';
        subscriptions[plan] = (subscriptions[plan] || 0) + 1;
    });
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(subscriptions).map(plan => plan.charAt(0).toUpperCase() + plan.slice(1)),
            datasets: [{
                data: Object.values(subscriptions),
                backgroundColor: ['#2563EB', '#10B981', '#F59E0B', '#EF4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Contact Form
function handleContactForm(event) {
    event.preventDefault();
    showToast('Thanks — we\'ll get back to you!');
    event.target.reset();
}

// Reviews Carousel
let currentReview = 0;
const reviews = document.querySelectorAll('.review-card');

function nextReview() {
    if (reviews.length === 0) return;
    
    reviews[currentReview].classList.remove('active');
    currentReview = (currentReview + 1) % reviews.length;
    reviews[currentReview].classList.add('active');
}

// Auto-rotate reviews every 5 seconds
setInterval(nextReview, 5000);

// Mobile Menu Toggle
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    
    // Check if user is logged in
    if (currentUser) {
        if (currentUser.role === 'admin') {
            showPage('admin-page');
            initializeAdmin();
        } else {
            showPage('dashboard-page');
            initializeDashboard();
        }
    }
    
    // Mobile menu toggle
    document.querySelector('.mobile-menu-toggle').addEventListener('click', toggleMobileMenu);
    
    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.search-box') && !event.target.closest('#medicine-suggestions')) {
            document.getElementById('medicine-suggestions').style.display = 'none';
        }
    });
    
    // Initialize current date for date inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('entry-date').value = today;
    document.getElementById('buying-date').value = today;
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Initialize default admin data for demo
function initializeDefaultData() {
    // Add default admin user if none exists
    if (users.length === 0) {
        users.push({
            id: 'admin001',
            firstName: 'System',
            lastName: 'Administrator',
            email: 'admin@stockeasy.com',
            password: 'admin123',
            role: 'admin',
            joinDate: new Date().toISOString(),
            status: 'active'
        });
        saveToLocalStorage();
    }
}

// Call initialization
initializeDefaultData();