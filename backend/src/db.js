const mysql = require("mysql2/promise");
const { DB_HOST, DB_USER, DB_PASS,DB_PORT,DB_NAME } = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL connected successfully to:", DB_NAME);
    connection.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
    process.exit(1); // stop app if DB is down
  }
})();

module.exports = pool;
