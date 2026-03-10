require("dotenv").config();
const mysql = require("mysql2/promise");

// create a pool of connections we can use with async/await
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// optional: quick test on startup
db.getConnection()
  .then(conn => {
    console.log("✅ Connected to MySQL!");
    conn.release();
  })
  .catch(err => {
    console.error("⚠️  DB connection error:", err.code || err.message);
    console.log("⚠️  Server will run but database features won't work.");
    console.log("⚠️  To fix: Set up MySQL and configure .env file");
  });

module.exports = db;


