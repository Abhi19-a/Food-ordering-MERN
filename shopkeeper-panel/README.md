# Shopkeeper Panel

Admin dashboard for managing food court inventory.

## Features

- 🔐 Secure login authentication
- ➕ Add new food items
- ✏️ Edit existing items
- 🗑️ Delete items
- 💰 Update prices
- 🔄 Toggle item availability
- 🔍 Search functionality
- 📊 Real-time statistics

## Quick Start

1. Install dependencies:
   ```bash
   cd shopkeeper-panel
   npm install
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

3. Open browser:
   ```
   http://localhost:5000
   ```

## Default Credentials

- **Username:** `shopkeeper`
- **Password:** `admin123`

## Port Configuration

The panel runs on port **5000** by default. You can change this in the `.env` file:

```env
ADMIN_PORT=5000
```

## Database

Uses the same MongoDB database as the main application (`foodcourt`).

## API Endpoints

- `POST /api/admin/login` - Login
- `GET /api/admin/foods` - Get all items
- `GET /api/admin/foods/:id` - Get single item
- `POST /api/admin/foods` - Add new item
- `PUT /api/admin/foods/:id` - Update item
- `DELETE /api/admin/foods/:id` - Delete item
- `PATCH /api/admin/foods/:id/toggle-availability` - Toggle availability

## Tech Stack

- **Backend:** Node.js, Express, MongoDB
- **Frontend:** Vanilla JavaScript, HTML, CSS
- **Database:** MongoDB (shared with main app)
