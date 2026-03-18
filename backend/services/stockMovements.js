const db = require("../config/db");

let _ensured = false;

async function ensureStockMovementsTable() {
  if (_ensured) return;
  await db.query(
    `CREATE TABLE IF NOT EXISTS stock_movements (
      id INT NOT NULL AUTO_INCREMENT,
      product_id INT NOT NULL,
      size VARCHAR(50) NULL,
      movement_type ENUM('incoming', 'outgoing', 'adjustment') NOT NULL,
      quantity INT NOT NULL,
      reference_type VARCHAR(40) NULL,
      reference_id INT NULL,
      note VARCHAR(255) NULL,
      actor_user_id INT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_stock_movements_product (product_id),
      KEY idx_stock_movements_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci`
  );
  _ensured = true;
}

async function recordStockMovement({
  conn = null,
  productId,
  size = null,
  movementType,
  quantity,
  referenceType = null,
  referenceId = null,
  note = null,
  actorUserId = null,
}) {
  await ensureStockMovementsTable();
  const executor = conn || db;
  await executor.query(
    `INSERT INTO stock_movements
      (product_id, size, movement_type, quantity, reference_type, reference_id, note, actor_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(productId),
      size ? String(size) : null,
      String(movementType),
      Number(quantity),
      referenceType ? String(referenceType) : null,
      referenceId == null ? null : Number(referenceId),
      note ? String(note).slice(0, 255) : null,
      actorUserId == null ? null : Number(actorUserId),
    ]
  );
}

module.exports = {
  ensureStockMovementsTable,
  recordStockMovement,
};

