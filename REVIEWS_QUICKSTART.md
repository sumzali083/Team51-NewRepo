# Customer Reviews - Quick Start Guide

## What Was Created

### Backend Files
1. **`backend/routes/reviews.js`** - Complete review API with 4 endpoints
2. **`backend/database/reviews-migration.sql`** - Database schema
3. **`backend/database/REVIEWS_SETUP.md`** - Detailed setup documentation
4. **`backend/app.js`** - Updated to include review routes

### Frontend Changes
1. **`frontend/src/ProductPage.jsx`** - Updated to use backend reviews and require login
2. **`frontend/src/components/Login.jsx`** - Stores user in sessionStorage

---

## Setup Steps (For Local Testing)

### Step 1: Create Database Table
Run this SQL in MySQL:
```sql
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment LONGTEXT NOT NULL,
  reviewer_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Step 2: Start Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:21051
```

### Step 3: Frontend Already Running
The frontend dev server is already running on http://localhost:5174

---

## How It Works

### User Flow for Reviews

1. **User Visits Product Page** → Reviews load from backend
2. **User Not Logged In** → See "Login Required!" message
3. **User Clicks "Go to Login"** → Redirect to login page
4. **User Logs In** → User data stored in sessionStorage
5. **User Returns to Product** → Review form is now enabled
6. **User Fills Form & Submits** → Review sent to backend with user_id
7. **Review Saved to Database** → Appears immediately on page

---

## Key Features

✅ **Login Required** - Can't post review without login
✅ **Database Storage** - Reviews persist permanently 
✅ **User Tracking** - Know who posted each review
✅ **Star Rating** - 1-5 star ratings
✅ **Real-time Display** - Reviews appear immediately after posting
✅ **Error Handling** - User-friendly error messages
✅ **Loading States** - Shows "Loading reviews..." and "Posting..." indicators

---

## Testing Checklist

- [ ] Database table created successfully
- [ ] Backend server running on port 21051
- [ ] Frontend dev server running on port 5174
- [ ] Can view products without login
- [ ] Review form shows "Login Required" when not logged in
- [ ] Can login/register on LoginPage
- [ ] Review form enabled after login
- [ ] Can submit review successfully
- [ ] Review appears immediately on page
- [ ] Can view reviews in MySQL database

---

## API Endpoints Summary

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| GET | `/api/reviews/:productId` | No | Get all reviews for a product |
| POST | `/api/reviews/:productId` | Yes* | Create new review |
| DELETE | `/api/reviews/:reviewId` | Yes* | Delete review |
| GET | `/api/reviews` | No | Get all reviews (admin) |

*Sent via `x-user-id` header

---

## File References

📄 **Database Schema:** [backend/database/reviews-migration.sql](../database/reviews-migration.sql)

📄 **Detailed Setup:** [backend/database/REVIEWS_SETUP.md](../database/REVIEWS_SETUP.md)

📄 **Review Routes API:** [backend/routes/reviews.js](../routes/reviews.js)

📱 **Frontend Component:** [frontend/src/ProductPage.jsx](../../frontend/src/ProductPage.jsx)

---

## Common Issues & Solutions

### Issue: "Failed to post review"
**Solution:** Make sure backend is running on port 21051

### Issue: "You must be logged in to review"
**Solution:** Login first, then go back to product page

### Issue: Reviews not loading
**Solution:** Check if reviews table exists in database

### Issue: Can't delete review
**Solution:** You can only delete your own reviews

---

## Notes

- Reviews are now **database-persistent** (not localStorage)
- Users are **identified by ID**, not anonymous
- Reviews include **timestamps** for sorting
- System gracefully handles **local development** (no DB scenario)
- Backend has **fallback responses** for development mode

---

## Next Steps

1. ✅ Run SQL migration to create table
2. ✅ Start backend server
3. ✅ Test user registration/login
4. ✅ Test review submission on product page
5. ✅ Verify reviews appear in MySQL database
6. 🚀 Ready for production!

---

Questions? Check the detailed setup guide at [REVIEWS_SETUP.md](REVIEWS_SETUP.md)
