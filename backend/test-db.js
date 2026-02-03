const db = require('./config/db');

async function run() {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS cnt FROM products');
    console.log('products count:', rows[0].cnt);

    const [sample] = await db.query('SELECT id, sku, name, price, description FROM products LIMIT 1');
    if (sample.length) console.log('sample product:', sample[0]);
    else console.log('no sample product found');
  } catch (err) {
    console.error('DB test error:', err.message || err);
  } finally {
    process.exit(0);
  }
}

run();
