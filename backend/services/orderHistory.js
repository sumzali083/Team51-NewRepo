const db = require("../config/db");

async function getColumnSet(tableName) {
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM ??", [tableName]);
    return new Set(rows.map((r) => r.Field));
  } catch (err) {
    if (err && err.code === "ER_NO_SUCH_TABLE") return null;
    throw err;
  }
}

async function fetchOrders(userId) {
  const orderCols = await getColumnSet("orders");
  if (!orderCols) return [];

  const orderBy = orderCols.has("created_at") ? "created_at DESC" : "id DESC";
  const [orders] = await db.query(
    `SELECT * FROM orders WHERE user_id = ? ORDER BY ${orderBy}`,
    [userId]
  );
  return orders;
}

async function fetchOrderItems(orderId) {
  const orderItemCols = await getColumnSet("order_items");
  if (!orderItemCols) return [];

  const productCols = await getColumnSet("products");
  if (!productCols) return [];

  const hasPriceEach = orderItemCols.has("price_each");
  const hasPrice = orderItemCols.has("price");
  const priceExpr = hasPriceEach
    ? "oi.price_each AS price_each"
    : hasPrice
      ? "oi.price AS price_each"
      : "0 AS price_each";

  const nameExpr = productCols.has("name")
    ? "p.name AS name"
    : "CONCAT('Product #', oi.product_id) AS name";

  let imageExpr = "NULL AS image";
  const imageCols = await getColumnSet("product_images");
  if (
    imageCols &&
    imageCols.has("product_id") &&
    (imageCols.has("url") || imageCols.has("image_url"))
  ) {
    const urlCol = imageCols.has("url") ? "url" : "image_url";
    const orderParts = [];
    if (imageCols.has("sort_order")) orderParts.push("pi.sort_order ASC");
    if (imageCols.has("id")) orderParts.push("pi.id ASC");
    if (imageCols.has("image_id")) orderParts.push("pi.image_id ASC");

    const orderSql = orderParts.length ? ` ORDER BY ${orderParts.join(", ")}` : "";
    imageExpr = `(
      SELECT pi.${urlCol}
      FROM product_images pi
      WHERE pi.product_id = p.id
      ${orderSql}
      LIMIT 1
    ) AS image`;
  }

  const [items] = await db.query(
    `SELECT
      oi.product_id,
      oi.quantity,
      ${priceExpr},
      ${nameExpr},
      ${imageExpr}
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?`,
    [orderId]
  );
  return items;
}

function getOrderId(order) {
  if (order && order.id != null) return order.id;
  if (order && order.order_id != null) return order.order_id;
  return null;
}

function normalizeOrder(order) {
  if (order.id == null && order.order_id != null) {
    return { ...order, id: order.order_id };
  }
  return order;
}

async function getOrderHistoryForUser(userId) {
  const rows = await fetchOrders(userId);
  const orders = rows.map(normalizeOrder);

  for (const order of orders) {
    const orderId = getOrderId(order);
    order.items = orderId == null ? [] : await fetchOrderItems(orderId);
  }

  return orders;
}

module.exports = { getOrderHistoryForUser };
