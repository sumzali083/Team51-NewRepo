-- Database setup for customer reviews
-- Run this SQL script to create the reviews table

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
  
  -- Foreign key constraints (if you have these tables)
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes for better query performance
  INDEX idx_product_id (product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Add unique constraint to prevent duplicate reviews from same user on same product
ALTER TABLE reviews ADD UNIQUE KEY unique_user_product (user_id, product_id);

-- Sample query to test the table
-- SELECT r.id, r.product_id, r.rating, r.comment, r.reviewer_name, r.created_at, u.name AS user_name
-- FROM reviews r
-- LEFT JOIN users u ON r.user_id = u.id
-- ORDER BY r.created_at DESC;
