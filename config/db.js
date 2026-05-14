const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONN_LIMIT ? parseInt(process.env.DB_CONN_LIMIT, 10) : 10,
    // Enable SSL when DB_SSL is set to 'true' and provider requires it (e.g., hosted MySQL)
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } : undefined,
});

// quick test of connection when the module is required
pool.getConnection((err, connection) => {
    if (err) {
        console.error('MySQL connection failed:', err.message || err);
    } else {
        console.log('MySQL pool connected');
        connection.release();
    }
});

module.exports = pool;