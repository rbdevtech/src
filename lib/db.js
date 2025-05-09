// src/lib/db.js
import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Execute a query with parameters
export async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Close the connection pool (useful for tests)
export async function closePool() {
  await pool.end();
}

// Get a direct connection from the pool
export async function getConnection() {
  return await pool.getConnection();
}