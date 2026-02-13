const API_URL = 'http://localhost:5000/api/admin';
let authToken = localStorage.getItem('adminToken');
let allFoods = [];
let editingItemId = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const addItemBtn = document.getElementById('addItemBtn');
const itemModal = document.getElementById('itemModal');
const itemForm = document.getElementById('itemForm');
const searchInput = document.getElementById('searchInput');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showDashboard();
    } else {
        showLogin();
    }
});

// Login
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
        } else {
            alert('Invalid credentials!');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    authToken = null;
    showLogin();
});

// Show/Hide Screens
function showLogin() {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
}

function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
    loadFoods();
}

// Load all food items
async function loadFoods() {
    try {
        const response = await fetch(`${API_URL}/foods`);
        allFoods = await response.json();
        displayFoods(allFoods);
        updateStats();
    } catch (error) {
        console.error('Error loading foods:', error);
        alert('Failed to load food items');
    }
}

// Display foods in table
function displayFoods(foods) {
    const tbody = document.getElementById('foodTableBody');

    if (foods.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    No items found. Click "Add New Item" to get started!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = foods.map(food => `
        <tr>
            <td>
                <img src="${food.imageUrl || 'https://via.placeholder.com/60'}" 
                     alt="${food.name}" 
                     class="item-image"
                     onerror="this.src='https://via.placeholder.com/60?text=No+Image'">
            </td>
            <td>
                <div class="item-name">${food.name}</div>
                <small style="color: #999;">${food.description || 'No description'}</small>
            </td>
            <td>${food.category}</td>
            <td><span class="price-tag">₹${food.price.toFixed(2)}</span></td>
            <td>
                <span class="status-badge ${food.available ? 'status-available' : 'status-unavailable'}">
                    ${food.available ? '✓ Available' : '✗ Unavailable'}
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
    `).join('');
}

// Update statistics
function updateStats() {
    document.getElementById('totalItems').textContent = allFoods.length;
    document.getElementById('availableItems').textContent =
        allFoods.filter(f => f.available).length;
    document.getElementById('unavailableItems').textContent =
        allFoods.filter(f => !f.available).length;
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allFoods.filter(food =>
        food.name.toLowerCase().includes(searchTerm) ||
        food.category.toLowerCase().includes(searchTerm)
    );
    displayFoods(filtered);
});

// Open modal for adding new item
addItemBtn.addEventListener('click', () => {
    editingItemId = null;
    document.getElementById('modalTitle').textContent = 'Add New Item';
    itemForm.reset();
    document.getElementById('itemAvailable').checked = true;
    openModal();
});

// Edit item
async function editItem(id) {
    editingItemId = id;
    document.getElementById('modalTitle').textContent = 'Edit Item';

    try {
        const response = await fetch(`${API_URL}/foods/${id}`);
        const food = await response.json();

        document.getElementById('itemId').value = food._id;
        document.getElementById('itemName').value = food.name;
        document.getElementById('itemPrice').value = food.price;
        document.getElementById('itemCategory').value = food.category;
        document.getElementById('itemImage').value = food.imageUrl || '';
        document.getElementById('itemDescription').value = food.description || '';
        document.getElementById('itemAvailable').checked = food.available;

        openModal();
    } catch (error) {
        console.error('Error loading item:', error);
        alert('Failed to load item details');
    }
}

// Save item (add or update)
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
            alert(editingItemId ? 'Item updated successfully!' : 'Item added successfully!');
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error saving item:', error);
        alert('Failed to save item');
    }
});

// Toggle availability
async function toggleAvailability(id) {
    try {
        const response = await fetch(`${API_URL}/foods/${id}/toggle-availability`, {
            method: 'PATCH'
        });

        if (response.ok) {
            loadFoods();
        } else {
            alert('Failed to toggle availability');
        }
    } catch (error) {
        console.error('Error toggling availability:', error);
        alert('Failed to toggle availability');
    }
}

// Delete item
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/foods/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadFoods();
            alert('Item deleted successfully!');
        } else {
            alert('Failed to delete item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
    }
}

// Modal functions
function openModal() {
    itemModal.classList.add('active');
}

function closeModal() {
    itemModal.classList.remove('active');
    itemForm.reset();
    editingItemId = null;
}

// Close modal on outside click
itemModal.addEventListener('click', (e) => {
    if (e.target === itemModal) {
        closeModal();
    }
});
