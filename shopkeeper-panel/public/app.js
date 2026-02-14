const API_URL = 'http://localhost:5000/api/admin';
const BACKEND_URL = 'http://localhost:4000';
let authToken = localStorage.getItem('adminToken');
let allFoods = [];
let allOrders = [];
let editingItemId = null;
let socket = null;
let unreadOrdersCount = 0;

// ===== Image files list (same as frontend) =====
const imageFiles = [
    "Anjeer.jpeg", "Apple Milkshake.jpeg", "Avil Milk.jpeg", "Banana Milkshake.jpeg",
    "Bel Poori.jpeg", "Belgian Dark Chocolate.jpeg", "Blackcurrant.jpeg", "Blue Ocean.jpeg",
    "Boiled Egg.jpg", "Bread Omelet.jpg", "Buns.jpg", "Butter Scotch Milkshake.jpeg",
    "Butterscotch Icecream.jpeg", "Carrot Juice.jpeg", "Chapathi Kurma.jpg",
    "cheese-maggi.jpg", "chicken-biryani.jpg", "chicken-gravy-parota.png",
    "Chicken Burger.jpg", "Chicken Chilli.jpg", "Chicken Fried Rice.jpg",
    "Chicken M Fried Rice.jpg", "Chicken M Noodles.jpg", "Chicken Manchurian.jpg",
    "Chicken Noodles.jpg", "Chicken Nuggets.jpg", "Chicken Roll + Coke.jpeg",
    "Chicken Roll.jpg", "Chicken Sausage.jpg", "Chikku Milkshake.jpeg",
    "Chilli Guava Squash.jpeg", "Chocolate Icecream.jpeg", "Coke Floating.jpeg",
    "Cold Coffee.jpeg", "Cold Horlicks.jpeg", "Curd Rice.jpg", "Dahi Poori.jpeg",
    "Dahi Vada.jpg", "Dilkush.jpeg", "Egg Fried Rice.jpg", "Egg Gravy Parota.jpg",
    "Egg Maggi.jpg", "Egg Noodles.jpg", "Egg Pav.jpg", "English Toffee.jpeg",
    "French Fries with Cheese.jpg", "french-fries.jpg", "Fruit Bowl.jpeg",
    "Fruit Salad.jpeg", "Gobi Chilli.jpg", "Gobi Manchurian.jpg", "Gobi Noodles.jpg",
    "Gobi Pav.jpg", "Gobi Rice.jpg", "Grapes.jpeg", "Green Apple.jpeg",
    "Guava Milkshake.jpeg", "Gudbud.jpeg", "hocolate Milkshake.jpeg", "Idli Vada.jpg",
    "Imli Banta.jpeg", "Kori Rotti.jpg", "Lassi.jpeg", "Lime Ginger.jpeg",
    "Lime Juice.jpeg", "Lime Soda.jpeg", "maggi.jpg", "Malpe Milkshake.jpeg",
    "Mango Icecream.jpeg", "Mango Juice.jpeg", "Mango Milkshake.jpeg",
    "Masala Lemonade.jpeg", "Masala Poori.jpeg", "masala-dosa.jpg", "Mint Mojito.jpeg",
    "Missel Pav.jpg", "Mixed Fruit.jpeg", "Musambi.jpeg", "Musk Melon.jpeg",
    "Onion Dosa.jpg", "Onion Pakoda.jpg", "Orange.jpeg", "Oreo Milkshake.jpeg",
    "Paneer Chilli.jpg", "Paneer M Fried Rice.jpg", "Paneer M Noodles.jpg",
    "Paneer Manchurian.jpg", "Paneer Pav Bhaji.jpeg", "Paneer Roll + Coke.jpeg",
    "paneer-roll.jpg", "Pani Puri.jpeg", "Parota Kurma.jpg", "Pav Bhaji.jpeg",
    "Pepper Chicken Rice.jpg", "Pepper Chicken.jpg", "peri-peri-french-fries.jpg",
    "Pineapple.jpeg", "Pinklady.jpeg", "Pista Icecream.jpeg", "Pista Milkshake.jpeg",
    "Plain Dosa.jpg", "Pomegranate.jpeg", "Pulav.jpg", "Pundi Gasi.jpeg",
    "Puri Baji.jpg", "Rose Fatooda.jpeg", "Rose Milkshake.jpeg", "Samosa Pav.jpg",
    "Schezwan C Noodles.jpg", "Schezwan C Rice.jpg", "Schezwan Masala Dosa.jpg",
    "Sev Poori.jpeg", "Set Dosa.jpg", "Sharjah Shake.jpeg",
    "Strawberry Icecream.jpeg", "Strawberry Milkshake.jpeg",
    "Tandoori Kabab (1Pc).jpg", "Tangy Mango Twist.jpeg",
    "Tripple C Fried Rice.jpg", "Tripple C Noodles.jpg", "Tuppa Dosa.jpg",
    "Tutty Fruity.jpeg", "Vada Pav.jpg", "Vanilla Ice Cream.jpeg",
    "Vanilla Milkshake.jpeg", "Veg Burger + French Fries + Cheese + Coke.jpeg",
    "Veg Burger + French Fries + Coke.jpeg", "Veg Burger.jpg", "Veg Cutlet.jpg",
    "Veg Fried Rice.jpg", "Veg Noodles.jpg", "Veg Pulav.jpg",
    "Veg Schezwan Noodles.jpg", "Veg Schezwan Rice.jpg", "Watermelon.jpeg",
    "Yellu (Sesame).jpeg"
];

// ===== DOM Elements =====
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const addItemBtn = document.getElementById('addItemBtn');
const itemModal = document.getElementById('itemModal');
const itemForm = document.getElementById('itemForm');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Populate image dropdown
    populateImageDropdown();

    // Setup tab navigation
    setupTabs();

    if (authToken) {
        showDashboard();
        connectSocket();
    } else {
        showLogin();
    }
});

// ===== Socket.IO Connection =====
function connectSocket() {
    if (socket) return;

    socket = io(BACKEND_URL);

    socket.on('connect', () => {
        console.log('🔌 Connected to backend');
    });

    socket.on('newOrder', (order) => {
        console.log('🔔 New order received:', order);

        // Play notification sound
        playNotificationSound();

        // Show toast notification
        showToast(`New order from ${order.customerName}!`, 'info');

        // Update notification badge
        unreadOrdersCount++;
        updateNotificationBadge();

        // Reload orders
        loadOrders();
    });

    socket.on('disconnect', () => {
        console.log('❌ Disconnected from backend');
    });
}

// ===== Notification Sound =====
function playNotificationSound() {
    const audio = document.getElementById('notificationSound');
    if (audio) {
        audio.play().catch(e => console.log('Could not play sound:', e));
    }
}

// ===== Update Notification Badge =====
function updateNotificationBadge() {
    const badge = document.getElementById('orderNotificationBadge');
    if (unreadOrdersCount > 0) {
        badge.textContent = unreadOrdersCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

// ===== Tab Navigation =====
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            document.getElementById(`${tabName}Tab`).classList.add('active');

            // If switching to orders tab, clear notifications
            if (tabName === 'orders') {
                unreadOrdersCount = 0;
                updateNotificationBadge();
                loadOrders();
            }
        });
    });
}

// ===== Theme Toggle =====
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('adminTheme', isDark ? 'dark' : 'light');
});

// ===== Populate image dropdown =====
function populateImageDropdown() {
    const select = document.getElementById('itemImage');
    imageFiles.forEach(filename => {
        const option = document.createElement('option');
        option.value = `/images/${filename}`;
        option.textContent = filename.replace(/\.[^.]+$/, '');
        select.appendChild(option);
    });

    select.addEventListener('change', () => {
        const preview = document.getElementById('imagePreview');
        const img = document.getElementById('imagePreviewImg');
        if (select.value) {
            img.src = select.value;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    });
}

// ===== Toast Notification =====
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== Login =====
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.token;
            localStorage.setItem('adminToken', authToken);
            showDashboard();
            connectSocket();
            showToast('Login successful!');
        } else {
            showToast('Invalid credentials!', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
    }
});

// ===== Logout =====
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    authToken = null;
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    showLogin();
});

// ===== Show/Hide Screens =====
function showLogin() {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
}

function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
    loadFoods();
    loadOrders();
}

// ===== Load all food items =====
async function loadFoods() {
    try {
        const response = await fetch(`${API_URL}/foods`);
        allFoods = await response.json();
        displayFoods(allFoods);
        updateStats();
    } catch (error) {
        console.error('Error loading foods:', error);
        showToast('Failed to load food items', 'error');
    }
}

// ===== Load all orders =====
async function loadOrders() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/orders`);
        allOrders = await response.json();
        displayOrders(allOrders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Failed to load orders', 'error');
    }
}

// ===== Display orders in table =====
function displayOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    No orders yet. Waiting for customers...
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const itemsPreview = order.items.slice(0, 2).map(item =>
            `${item.name} (x${item.quantity})`
        ).join(', ') + (order.items.length > 2 ? '...' : '');

        const timeAgo = getTimeAgo(order.createdAt || order.date);

        return `
        <tr class="${isRecentOrder(order) ? 'new-order-highlight' : ''}">
            <td><strong>${order.orderId}</strong></td>
            <td>
                <div>${order.customerName || 'Guest'}</div>
                <small style="color: var(--text-muted);">${order.customerEmail || ''}</small>
            </td>
            <td class="order-items-cell">
                <div class="order-item-preview">${itemsPreview}</div>
                <small>(${order.items.length} item${order.items.length > 1 ? 's' : ''})</small>
            </td>
            <td><span class="price-tag">₹${order.amount.toFixed(2)}</span></td>
            <td>
                <span class="status-badge order-status-${order.status.toLowerCase()}">
                    ${order.status.toUpperCase()}
                </span>
            </td>
            <td class="time-ago">${timeAgo}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="viewOrderDetails('${order._id}')" title="View">
                        👁️ View
                    </button>
                    <button class="btn-icon btn-toggle" onclick="markAsDelivered('${order._id}')" title="Mark Delivered">
                        ✅ Deliver
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
}

// ===== Helper: Check if order is recent (< 10 seconds old) =====
function isRecentOrder(order) {
    const orderTime = new Date(order.createdAt || order.date).getTime();
    const now = Date.now();
    return (now - orderTime) < 10000; // 10 seconds
}

// ===== Helper: Get time ago string =====
function getTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

// ===== View order details =====
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o._id === orderId);
    if (!order) return;

    const itemsList = order.items.map(item =>
        `- ${item.name} x ${item.quantity} @ ₹${item.price} = ₹${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    alert(`ORDER DETAILS\n\nOrder ID: ${order.orderId}\n\nCustomer: ${order.customerName}\nEmail: ${order.customerEmail}\nPhone: ${order.customerPhone}\n\nItems:\n${itemsList}\n\nTotal: ₹${order.amount.toFixed(2)}\nStatus: ${order.status.toUpperCase()}`);
}

// ===== Mark order as delivered =====
async function markAsDelivered(orderId) {
    if (!confirm('Mark this order as delivered?')) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'delivered' })
        });

        if (response.ok) {
            showToast('Order marked as delivered!');
            loadOrders();
        } else {
            showToast('Failed to update order', 'error');
        }
    } catch (error) {
        console.error('Error updating order:', error);
        showToast('Failed to update order', 'error');
    }
}

// ===== Resolve image URL for display =====
function resolveImageUrl(food) {
    if (food.imageUrl && food.imageUrl.startsWith('/images/')) {
        return food.imageUrl;
    }

    const foodName = food.name.toLowerCase();
    const match = imageFiles.find(filename => {
        const imgName = filename.replace(/\.[^.]+$/, '').toLowerCase();
        return imgName.includes(foodName) || foodName.includes(imgName);
    });

    if (match) return `/images/${match}`;
    return food.imageUrl || '/images/Buns.jpg';
}

// ===== Display foods in table =====
function displayFoods(foods) {
    const tbody = document.getElementById('foodTableBody');

    if (foods.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    No items found. Click "Add New Item" to get started!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = foods.map(food => {
        const imgUrl = resolveImageUrl(food);
        return `
        <tr>
            <td>
                <img src="${imgUrl}" 
                     alt="${food.name}" 
                     class="item-image"
                     onerror="this.src='/images/Buns.jpg'">
            </td>
            <td>
                <div class="item-name">${food.name}</div>
                <small style="color: var(--text-muted);">${food.description || ''}</small>
            </td>
            <td>${food.category || 'N/A'}</td>
            <td><span class="price-tag">₹${food.price.toFixed(2)}</span></td>
            <td>
                <span class="status-badge ${food.available !== false ? 'status-available' : 'status-unavailable'}">
                    ${food.available !== false ? '✓ Available' : '✗ Unavailable'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editItem('${food._id}')" title="Edit">
                        ✏️ Edit
                    </button>
                    <button class="btn-icon btn-toggle" onclick="toggleAvailability('${food._id}')" title="Toggle">
                        🔄 Toggle
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteItem('${food._id}')" title="Delete">
                        🗑️ Delete
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
}

// ===== Update statistics =====
function updateStats() {
    document.getElementById('totalItems').textContent = allFoods.length;
    document.getElementById('availableItems').textContent =
        allFoods.filter(f => f.available !== false).length;
    document.getElementById('unavailableItems').textContent =
        allFoods.filter(f => f.available === false).length;
}

// ===== Search functionality =====
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allFoods.filter(food =>
        food.name.toLowerCase().includes(searchTerm) ||
        (food.category && food.category.toLowerCase().includes(searchTerm))
    );
    displayFoods(filtered);
});

// ===== Open modal for adding new item =====
addItemBtn.addEventListener('click', () => {
    editingItemId = null;
    document.getElementById('modalTitle').textContent = 'Add New Item';
    itemForm.reset();
    document.getElementById('itemAvailable').checked = true;
    document.getElementById('imagePreview').style.display = 'none';
    openModal();
});

// ===== Edit item =====
async function editItem(id) {
    editingItemId = id;
    document.getElementById('modalTitle').textContent = 'Edit Item';

    try {
        const response = await fetch(`${API_URL}/foods/${id}`);
        const food = await response.json();

        document.getElementById('itemId').value = food._id;
        document.getElementById('itemName').value = food.name;
        document.getElementById('itemPrice').value = food.price;
        document.getElementById('itemCategory').value = food.category || '';
        document.getElementById('itemDescription').value = food.description || '';
        document.getElementById('itemAvailable').checked = food.available !== false;

        const imageSelect = document.getElementById('itemImage');
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('imagePreviewImg');

        if (food.imageUrl) {
            imageSelect.value = food.imageUrl;
            previewImg.src = food.imageUrl;
            preview.style.display = 'block';
        } else {
            imageSelect.value = '';
            preview.style.display = 'none';
        }

        openModal();
    } catch (error) {
        console.error('Error loading item:', error);
        showToast('Failed to load item details', 'error');
    }
}

// ===== Save item (add or update) =====
itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const itemData = {
        name: document.getElementById('itemName').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        category: document.getElementById('itemCategory').value,
        imageUrl: document.getElementById('itemImage').value,
        description: document.getElementById('itemDescription').value,
        available: document.getElementById('itemAvailable').checked
    };

    try {
        let response;
        if (editingItemId) {
            response = await fetch(`${API_URL}/foods/${editingItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
        } else {
            response = await fetch(`${API_URL}/foods`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
        }

        if (response.ok) {
            closeModal();
            loadFoods();
            showToast(editingItemId ? 'Item updated successfully!' : 'Item added successfully!');
        } else {
            const error = await response.json();
            showToast('Error: ' + error.error, 'error');
        }
    } catch (error) {
        console.error('Error saving item:', error);
        showToast('Failed to save item', 'error');
    }
});

// ===== Toggle availability =====
async function toggleAvailability(id) {
    try {
        const response = await fetch(`${API_URL}/foods/${id}/toggle-availability`, {
            method: 'PATCH'
        });

        if (response.ok) {
            loadFoods();
            showToast('Availability toggled!', 'info');
        } else {
            showToast('Failed to toggle availability', 'error');
        }
    } catch (error) {
        console.error('Error toggling availability:', error);
        showToast('Failed to toggle availability', 'error');
    }
}

// ===== Delete item =====
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item? This will also remove it from the customer menu.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/foods/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadFoods();
            showToast('Item deleted successfully!');
        } else {
            showToast('Failed to delete item', 'error');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showToast('Failed to delete item', 'error');
    }
}

// ===== Modal functions =====
function openModal() {
    itemModal.classList.add('active');
}

function closeModal() {
    itemModal.classList.remove('active');
    itemForm.reset();
    document.getElementById('imagePreview').style.display = 'none';
    editingItemId = null;
}

itemModal.addEventListener('click', (e) => {
    if (e.target === itemModal) {
        closeModal();
    }
});
