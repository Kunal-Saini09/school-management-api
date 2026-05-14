const mysql = require("mysql2");

function parseDatabaseUrl(dbUrl) {
    try {
        const url = new URL(dbUrl);
        const config = {
            host: url.hostname,
            port: url.port ? parseInt(url.port, 10) : 3306,
            user: decodeURIComponent(url.username || ''),
            password: decodeURIComponent(url.password || ''),
            database: url.pathname ? url.pathname.replace(/^\//, '') : undefined,
        };

        // Accept common query params: ?ssl=true or ?sslmode=require
        const sslParam = url.searchParams.get('ssl') || url.searchParams.get('sslmode');
        if (sslParam && (sslParam === 'true' || sslParam === 'require')) {
            config.ssl = { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' };
        }

        return config;
    } catch (err) {
        console.error('Failed to parse DB_URL:', err.message || err);
        return null;
    }
}

// Build pool config from DB_URL if provided, otherwise from individual env vars
let poolConfig;
if (process.env.DB_URL) {
    const parsed = parseDatabaseUrl(process.env.DB_URL);
    if (parsed) {
        poolConfig = Object.assign(parsed, {
            waitForConnections: true,
            connectionLimit: process.env.DB_CONN_LIMIT ? parseInt(process.env.DB_CONN_LIMIT, 10) : 10,
        });
    }
}

if (!poolConfig) {
    poolConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
        waitForConnections: true,
        connectionLimit: process.env.DB_CONN_LIMIT ? parseInt(process.env.DB_CONN_LIMIT, 10) : 10,
    };

    if (process.env.DB_SSL === 'true') {
        poolConfig.ssl = { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' };
    }
}

const pool = mysql.createPool(poolConfig);

pool.getConnection((err, connection) => {
    if (err) {
        console.error('MySQL connection failed:', err.message || err);
    } else {
        console.log('MySQL pool connected');
        connection.release();
    }
});

module.exports = pool;