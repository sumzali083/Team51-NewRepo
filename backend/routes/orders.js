const express = require("express");
const db = require("../config/db");
const router = express.Router();

/**
 * POST /api/orders/checkout
 * Body: { userId }
 *
 * Steps:
 * 1. Get all basket_items for that user joined with products (for price)
 * 2. If empty → 400
 * 3. Calculate total price
 * 4. Insert into orders
 * 5. Insert each item into order_items
 * 6. Clear basket_items for that user
 */
router.post("/checkout", async (req, res) => {
  const userId = req.session && req.session.userId;

  if (!userId) {
    //validate userId
    return res.status(401).json({ message: "Please log in to checkout" });
  }

  let connection;

  try {
    const [userRows] = await db.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (!userRows.length) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const [cartItems] = await db.query(
      `SELECT b.id, b.product_id, b.quantity, p.price, p.stock
       FROM basket_items b
       JOIN products p ON b.product_id = p.id
       WHERE b.user_id = ?`,
      [userId]
    );
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ID ${item.product_id}`,
        });
      }
    }

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, total_price) VALUES (?, ?)",
      [userId, totalPrice]
    );
    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_each)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );

      await connection.query(
        `UPDATE products
         SET stock = stock - ?
         WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await connection.query("DELETE FROM basket_items WHERE user_id = ?", [userId]);

    await connection.commit();

    return res.status(201).json({
      saved: true,
      message: "Order placed",
      orderId,
      totalPrice,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback error:", rollbackErr);
      }
    }
    return res.status(500).json({ message: "Server error during checkout" });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * GET /api/orders/history
 * Returns all orders for a logged in user
 */

router.get("/history", async(req,res) =>{
  const userId = req.session && req.session.userId;

  if(!userId){
    return res.status(401).json({ message: "Please log in to view order history"});
  }

  try {
    // Get orders for user

    const result = await db.query(
      `SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [userId]
    );

    const orders = result[0];
    //get items for each order
    for (let i=0;i<orders.length;i++) {
      const order = orders[i];

      const itemResult = await db.query(
        `SELECT
          oi.product_id,
          oi.quantity,
          oi.price_each,
          p.name,
          (
            SELECT pi.url
            FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY pi.sort_order ASC, pi.id ASC
            LIMIT 1
          ) AS image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?`,
        [order.id]
      );

      const items = itemResult[0];
      order.items = items;
    }

    res.json(orders);

  } catch (err) {
    console.error("Order history error:", err);
    res.status(500).json({message:"Server error"});
  }
});

module.exports = router;
