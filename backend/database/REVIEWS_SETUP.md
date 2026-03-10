# Customer Reviews System - Setup Guide

## Overview
This document explains how to set up and use the backend customer reviews system for storing and managing product reviews in the MySQL database.

## Features
- ✅ Customers must be **logged in** to post reviews
- ✅ Reviews stored in **MySQL database** (not localStorage)
- ✅ Reviews include: rating (1-5), comment, reviewer name, timestamp
- ✅ Reviews tied to both product and user
- ✅ RESTful API endpoints for review management
- ✅ Backend validation and error handling

---

## Database Setup

### 1. Create the Reviews Table

Run this SQL script in your MySQL database:

```sql
-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment LONGTEXT NOT NULL,
  reviewer_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_product_id (product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Prevent duplicate reviews from same user on same product
ALTER TABLE reviews ADD UNIQUE KEY unique_user_product (user_id, product_id);
```

**Location:** Save this to `backend/database/reviews-migration.sql`

---

## API Endpoints

### 1. Get Reviews for a Product
```
GET /api/reviews/:productId
```

**Response:**
```json
[
  {
    "id": 1,
    "product_id": "m-001",
    "user_id": 5,
    "rating": 5,
    "comment": "Great quality!",
    "reviewer_name": "John Doe",
    "created_at": "2024-02-15T10:30:00Z",
    "user_name": "John Doe"
  }
]
```

---

### 2. Create a Review (Requires Login)
```
POST /api/reviews/:productId
Headers:
  - Content-Type: application/json
  - x-user-id: (user_id from login)

Body:
{
  "rating": 5,
  "comment": "Excellent product!",
  "reviewer_name": "John Doe",
  "user_id": 5
}
```

**Response (201 Created):**
```json
{
  "message": "Review posted successfully",
  "review": {
    "id": 1,
    "product_id": "m-001",
    "user_id": 5,
    "rating": 5,
    "comment": "Excellent product!",
    "reviewer_name": "John Doe",
    "created_at": "2024-02-15T10:30:00Z"
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "message": "User must be logged in to review"
}
```

---

### 3. Delete a Review (User-Owned Only)
```
DELETE /api/reviews/:reviewId
Headers:
  - x-user-id: (user_id)
```

**Response (200 OK):**
```json
{
  "message": "Review deleted successfully"
}
```

---

## Frontend Integration

### Login to Post Reviews

1. User must be **logged in** at `/login`
2. Login stores user info in `sessionStorage` with key: `"user"`
3. ProductPage automatically detects logged-in user and enables review form
4. Form shows "Login Required" message if user is not logged in

### ProductPage Review Flow

```javascript
// User data is loaded from sessionStorage
const storedUser = sessionStorage.getItem("user");
const user = JSON.parse(storedUser);

// Reviews are loaded from backend
const response = await fetch(`/api/reviews/${productId}`);
const reviews = await response.json();

// When submitting review, data is sent to backend
fetch(`/api/reviews/${productId}`, {
  method: "POST",
  headers: {
    "x-user-id": user.id  // Backend validates this
  },
  body: JSON.stringify({
    rating, comment, reviewer_name, user_id
  })
});
```

---

## Backend Routes Setup

The reviews routes are already configured in `backend/app.js`:

```javascript
const reviewRoutes = require("./routes/reviews");

// ... other routes ...

app.use("/api/reviews", reviewRoutes);
```

---

## File Structure

```
backend/
├── routes/
│   ├── reviews.js              # Review API endpoints
│   ├── users.js                # User login/registration
│   └── products.js
├── database/
│   └── reviews-migration.sql   # Database schema
└── app.js

frontend/
├── src/
│   ├── ProductPage.jsx         # Review form and display
│   ├── pages/
│   │   └── LoginPage.jsx       # User authentication
│   └── components/
│       └── Login.jsx           # Login component
```

---

## Testing the Reviews System

### 1. Create a User Account
```bash
POST http://localhost:21051/api/users/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Login to Get User ID
```bash
POST http://localhost:21051/api/users/login
{
  "email": "test@example.com",
  "password": "password123"
}
# Response includes user with id
```

### 3. Post a Review
```bash
POST http://localhost:21051/api/reviews/m-001
Headers:
  x-user-id: 1

{
  "rating": 5,
  "comment": "Love this product!",
  "reviewer_name": "Test User",
  "user_id": 1
}
```

### 4. View Reviews
```bash
GET http://localhost:21051/api/reviews/m-001
```

---

## Environment Variables

Ensure your `.env` file has correct database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=team51_shop
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | User not logged in | User must login first |
| 400 Bad Request | Missing fields | Check all required fields |
| 403 Forbidden | Can't delete other's review | Only user who posted can delete |
| 404 Not Found | Review doesn't exist | Check review ID |
| 500 Server Error | Database connection | Check MySQL is running |

---

## Security Considerations

1. **Authentication:** Uses `x-user-id` header from login session
2. **Authorization:** Users can only delete their own reviews
3. **Input Validation:** Rating must be 1-5, all fields required
4. **Database:** Foreign key enforces referential integrity
5. **Timestamps:** Automatic created_at/updated_at tracking

---

## Future Enhancements

- [ ] Add JWT token authentication instead of header-based
- [ ] Add review edit functionality
- [ ] Add review helpfulness voting (likes/dislikes)
- [ ] Add pagination for large review lists
- [ ] Add review moderation/flags
- [ ] Add admin review management dashboard
- [ ] Add email notifications for reviews
- [ ] Add review filtering (by rating, date, etc.)

---

## Support

For issues with the reviews system:
1. Check database connection in `.env`
2. Verify reviews table is created
3. Ensure user is logged in
4. Check browser console for errors
5. Check server logs for backend errors

---

Created: February 17, 2026
Last Updated: February 17, 2026
