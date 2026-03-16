// backend/routes/reviews.js
const express = require("express");
const db = require("../config/db");

const router = express.Router();

/**
 * Middleware to verify user is logged in (using JWT or session)
 * For now, we'll accept userId from request - in production, verify JWT token
 */
const verifyUser = (req, res, next) => {
    const userId =
        (req.session && req.session.userId) ||
        req.headers["x-user-id"] ||
        req.body.user_id;

    if (!userId) {
        return res.status(401).json({ message: "User must be logged in to review" });
    }

    req.user_id = userId;
    next();
};

/**
 * GET /api/reviews/:productId
 * Get all reviews for a specific product
 */
router.get("/:productId", async (req, res) => {
    const productId = req.params.productId;

    try {
        const [reviews] = await db.query(
            `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, 
              r.reviewer_name, r.created_at, u.name AS user_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
            [productId]
        );

        res.json(reviews || []);
    } catch (err) {
        console.error("Error fetching reviews:", err);

        // Fallback for local setup without DB
        if (err.code === "PROTOCOL_ERROR" || err.code === "ETIMEDOUT") {
            return res.json([]);
        }

        res.status(500).json({ message: "Failed to load reviews" });
    }
});

/**
 * POST /api/reviews/:productId
 * Create a new review (requires user login)
 * Body: { rating, comment, reviewer_name, user_id }
 */
router.post("/:productId", verifyUser, async (req, res) => {
    const { productId } = req.params;
    const { rating, comment, reviewer_name } = req.body;
    const user_id = req.user_id;

    if (!rating || !comment || !reviewer_name) {
        return res.status(400).json({
            message: "Rating, comment, and reviewer name are required"
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            message: "Rating must be between 1 and 5"
        });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO reviews (product_id, user_id, rating, comment, reviewer_name, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
            [productId, user_id, rating, comment, reviewer_name.trim()]
        );

        return res.status(201).json({
            message: "Review posted successfully",
            review: {
                id: result.insertId,
                product_id: productId,
                user_id: user_id,
                rating: rating,
                comment: comment,
                reviewer_name: reviewer_name.trim(),
                created_at: new Date().toISOString(),
            },
        });
    } catch (err) {
        console.error("Error creating review:", err);

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "You have already reviewed this product."
            });
        }

        // Fallback for local setup without DB
        if (err.code === "PROTOCOL_ERROR" || err.code === "ETIMEDOUT") {
            return res.status(201).json({
                message: "Review posted (DB not available in local setup)",
                review: {
                    id: Date.now(),
                    product_id: productId,
                    user_id: user_id,
                    rating: rating,
                    comment: comment,
                    reviewer_name: reviewer_name.trim(),
                    created_at: new Date().toISOString(),
                },
            });
        }

        res.status(500).json({ message: "Failed to post review" });
    }
});

/**
 * DELETE /api/reviews/:reviewId
 * Delete a review (only by the user who created it or admin)
 */
router.delete("/:reviewId", verifyUser, async (req, res) => {
    const { reviewId } = req.params;
    const user_id = req.user_id;

    try {
        // Check if review exists and belongs to user
        const [review] = await db.query(
            "SELECT user_id FROM reviews WHERE id = ?",
            [reviewId]
        );

        if (!review.length) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review[0].user_id != user_id) {
            return res.status(403).json({ message: "You can only delete your own reviews" });
        }

        // Delete the review
        await db.query("DELETE FROM reviews WHERE id = ?", [reviewId]);

        res.json({ message: "Review deleted successfully" });
    } catch (err) {
        console.error("Error deleting review:", err);

        // Fallback for local setup
        if (err.code === "PROTOCOL_ERROR" || err.code === "ETIMEDOUT") {
            return res.json({ message: "Review deleted (local mode)" });
        }

        res.status(500).json({ message: "Failed to delete review" });
    }
});

/**
 * GET /api/reviews
 * Get all reviews across all products (optional - for admin panel)
 */
router.get("/", async (req, res) => {
    try {
        const [reviews] = await db.query(
            `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, 
              r.reviewer_name, r.created_at, u.name AS user_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
        );

        res.json(reviews || []);
    } catch (err) {
        console.error("Error fetching all reviews:", err);

        if (err.code === "PROTOCOL_ERROR" || err.code === "ETIMEDOUT") {
            return res.json([]);
        }

        res.status(500).json({ message: "Failed to load reviews" });
    }
});

module.exports = router;
