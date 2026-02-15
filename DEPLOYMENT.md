# 🚀 Deployment Guide - Food Court MERN App

Complete step-by-step guide to deploy your Food Court application to the internet for FREE!

## 🌐 **Deployment Architecture**

- **Frontend (Customer App)** → Vercel
- **Shopkeeper Panel** → Vercel  
- **Backend API** → Render
- **Database** → MongoDB Atlas

All services are on the FREE tier!

---

## 📋 **Pre-Deployment Checklist**

Before deploying, make sure:
- ✅ All code is committed to GitHub
- ✅ MongoDB Atlas account setup (if not already)
- ✅ Clerk account is active
- ✅ All tests pass locally

---

## 🗄️ **STEP 1: Setup MongoDB Atlas (Database)**

### 1.1 Create Free MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with Google or Email
3. Choose **FREE** M0 cluster
4. Select **AWS** and choose a region close to you
5. Cluster name: `foodcourt-production`
6. Click **Create**

### 1.2 Configure Network Access

1. In Atlas Dashboard → **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

### 1.3 Create Database User

1. **Database Access** → **Add New Database User**
2. Username: `foodcourt-admin`
3. Password: (Generate a strong password - **save this!**)
4. Database User Privileges: **Read and write to any database**
5. Click **Add User**

### 1.4 Get Connection String

1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string:
   ```
   mongodb+srv://foodcourt-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Replace test database: change `/` to `/foodcourt`
7. **Final format**:
   ```
   mongodb+srv://foodcourt-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/foodcourt?retryWrites=true&w=majority
   ```
8. **SAVE THIS** - you'll need it for Render!

---

## 🖥️ **STEP 2: Deploy Backend to Render**

### 2.1 Create Render Account

1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub (recommended for auto-deploy)
3. Authorize Render to access your GitHub

### 2.2 Create New Web Service

1. Dashboard → **New** → **Web Service**
2. Connect your repository: `Abhi19-a/Food-ordering-MERN`
3. **Name**: `foodcourt-backend`
4. **Root Directory**: `backend`
5. **Environment**: `Node`
6. **Build Command**: `npm install`
7. **Start Command**: `node server.js`
8. **Plan**: **Free**

### 2.3 Add Environment Variables

Click **Advanced** → **Add Environment Variable**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `MONGO_URI` | `mongodb+srv://foodcourt-admin:YOUR_PASSWORD@...` |
| `CLERK_SECRET_KEY` | (from your Clerk dashboard) |

**Get Clerk Secret Key:**
1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Your App → **API Keys**
3. Copy **Secret Key** (starts with `sk_live_...` or `sk_test_...`)

### 2.4 Deploy

1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll see: ✅ **Live** with a green dot
4. **Copy your backend URL**: `https://foodcourt-backend-xxxx.onrender.com`
5. **SAVE THIS URL!**

### 2.5 Test Backend

Open your backend URL in browser:
```
https://foodcourt-backend-xxxx.onrender.com
```

You should see:
```
Backend server running successfully ✅
```

---

## 🎨 **STEP 3: Deploy Frontend to Vercel**

### 3.1 Create Vercel Account

1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Sign up with GitHub (recommended)
3. Authorize Vercel

### 3.2 Import Frontend Project

1. Dashboard → **Add New** → **Project**
2. **Import Git Repository** → Select `Food-ordering-MERN`
3. **Project Name**: `foodcourt-customer`
4. **Root Directory**: `frontend`
5. **Framework Preset**: Vite (should auto-detect)
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`

### 3.3 Add Environment Variables

Click **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | (from Clerk dashboard) |
| `VITE_API_URL` | `https://foodcourt-backend-xxxx.onrender.com` |
| `VITE_API_BASE` | `https://foodcourt-backend-xxxx.onrender.com` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | (your Stripe key - optional) |

**Get Clerk Publishable Key:**
1. Clerk Dashboard → **API Keys**
2. Copy **Publishable Key** (starts with `pk_live_...` or `pk_test_...`)

### 3.4 Deploy

1. Click **Deploy**
2. Wait for build (2-3 minutes)
3. Once deployed: 🎉 **Success!**
4. **Your frontend URL**: `https://foodcourt-customer.vercel.app`
5. **SAVE THIS URL!**

### 3.5 Test Frontend

Open your frontend URL and test:
- ✅ Can browse menu
- ✅ Can sign in with Clerk
- ✅ Can add items to cart
- ✅ Can place order

---

## 🏪 **STEP 4: Deploy Shopkeeper Panel to Vercel**

### 4.1 Import Shopkeeper Panel

1. Vercel Dashboard → **Add New** → **Project**
2. Select `Food-ordering-MERN` again
3. **Project Name**: `foodcourt-shopkeeper`
4. **Root Directory**: `shopkeeper-panel`
5. **Framework Preset**: Other
6. **Build Command**: `npm install`
7. Leave **Output Directory** empty

### 4.2 Add Environment Variables

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://foodcourt-admin:YOUR_PASSWORD@...` |
| `ADMIN_PORT` | `5000` |

### 4.3 Deploy

1. Click **Deploy**
2. Wait for deployment
3. **Your shopkeeper URL**: `https://foodcourt-shopkeeper.vercel.app`
4. **SAVE THIS URL!**

### 4.4 Test Shopkeeper Panel

Open shopkeeper URL:
- Login: `shopkeeper` / `admin123`
- ✅ Can view menu items
- ✅ Can receive orders in real-time
- ✅ Can mark orders as delivered

---

## ✅ **STEP 5: Update CORS in Backend**

Now that you have production URLs, update backend CORS:

1. Go to your backend code: `backend/server.js`
2. Find the `allowedOrigins` array
3. Uncomment and update with your actual URLs:

```javascript
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "http://10.111.16.25:5173",
  "http://10.111.16.25:5000",
  "https://foodcourt-customer.vercel.app",        // ← Add your frontend URL
  "https://foodcourt-shopkeeper.vercel.app"       // ← Add your shopkeeper URL
];
```

4. Commit and push:
```bash
git add backend/server.js
git commit -m "Add production URLs to CORS"
git push origin main
```

5. Render will auto-deploy the update!

---

## 🎯 **STEP 6: Final Testing**

### Test Complete Flow:

1. **Customer App** (`https://foodcourt-customer.vercel.app`):
   - Sign in
   - Browse menu
   - Add items to cart
   - Place order

2. **Shopkeeper Panel** (`https://foodcourt-shopkeeper.vercel.app`):
   - Login
   - Wait for real-time order notification 🔔
   - View order details
   - Mark as delivered

3. **Verify Database**:
   - MongoDB Atlas → **Collections**
   - Check `foods` and `orders` collections

---

## 📱 **Your Live URLs**

After deployment, your app is live at:

- **Customer Frontend**: `https://foodcourt-customer.vercel.app`
- **Shopkeeper Panel**: `https://foodcourt-shopkeeper.vercel.app`
- **Backend API**: `https://foodcourt-backend-xxxx.onrender.com`

**Share these URLs with anyone in the world!** 🌍

---

## 🔧 **Troubleshooting**

### Frontend shows "Network Error"
- ✅ Check environment variables in Vercel
- ✅ Verify backend URL is correct
- ✅ Check backend is running (green dot on Render)

### Backend shows CORS error
- ✅ Update `allowedOrigins` with production URLs
- ✅ Wait for Render auto-deploy
- ✅ Check browser console for exact error

### Orders not appearing in real-time
- ✅ Check Socket.IO connection in browser console
- ✅ Verify backend URL in shopkeeper panel app.js
- ✅ Check Render logs for Socket.IO connections

### MongoDB connection failed
- ✅ Verify MONGO_URI has correct password
- ✅ Check IP whitelist (0.0.0.0/0)
- ✅ Verify database user exists

### Render free tier spins down
- ⚠️ Free tier sleeps after 15 min of inactivity
- 🔄 First request takes 30s to wake up
- 💡 **Solution**: Upgrade to paid tier ($7/mo) or use cron job to ping every 10 min

---

## 🔄 **Auto-Deploy Updates**

After initial setup,  deployment is automatic:

1. Make changes locally
2. Commit: `git commit -m "Your changes"`
3. Push: `git push origin main`
4. ✨ **Auto-deploys to**:
   - Vercel (frontend + shopkeeper) - instant
   - Render (backend) - ~2 minutes

---

## 💰 **Costs**

All services used are **100% FREE**:

- ✅ MongoDB Atlas: 512MB free forever
- ✅ Vercel: Unlimited deployments on Hobby plan
- ✅ Render: 750 hours/month free (enough for 1 service 24/7)
- ✅ Clerk: 10,000 free users/month

**Total cost: $0/month** 🎉

---

## 🎓 **What You Learned**

- ✅ Full-stack deployment
- ✅ Environment variable management
- ✅ CORS configuration for production
- ✅ MongoDB Atlas setup
- ✅ CI/CD with GitHub
- ✅ Real-time WebSocket deployment
- ✅ Static site + API hosting

---

## 📞 **Support**

If you face issues:
1. Check Render logs (Dashboard → Logs)
2. Check Vercel deployment logs
3. Check browser console for errors
4. Verify all environment variables

---

**🎉 Congratulations! Your Food Court app is now LIVE on the internet!** 

Share your links with friends, family, and add them to your portfolio! 🚀
