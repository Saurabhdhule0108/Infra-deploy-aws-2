const express = require("express");
const mysql = require("mysql2/promise");

const app = express();

const PORT = 8080;

// Allow the application to read JSON request bodies
app.use(express.json());

// =========================================================
// DATABASE CONNECTION POOL
// =========================================================

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// =========================================================
// CREATE USERS TABLE
// =========================================================

async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Database connected successfully.");
        console.log("Users table is ready.");
    } catch (error) {
        console.error("Database initialization failed:", error.message);
    }
}

// =========================================================
// HOME ROUTE
// =========================================================

app.get("/", (req, res) => {
    res.send("Infra-deploy-aws-2 application is running with RDS MySQL!");
});

// =========================================================
// DATABASE HEALTH CHECK
// =========================================================

app.get("/db", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.json({
            status: "success",
            message: "Connected to Amazon RDS MySQL"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Database connection failed"
        });
    }
});

// =========================================================
// CREATE USER
// =========================================================

app.post("/users", async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "name and email are required"
            });
        }

        const [result] = await pool.execute(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            [name, email]
        );

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: result.insertId,
                name,
                email
            }
        });
    } catch (error) {
        console.error("Create user error:", error.message);

        res.status(500).json({
            message: "Failed to create user"
        });
    }
});

// =========================================================
// GET ALL USERS
// =========================================================

app.get("/users", async (req, res) => {
    try {
        const [users] = await pool.query(
            "SELECT id, name, email, created_at FROM users ORDER BY id"
        );

        res.json(users);
    } catch (error) {
        console.error("Get users error:", error.message);

        res.status(500).json({
            message: "Failed to retrieve users"
        });
    }
});

// =========================================================
// START APPLICATION
// =========================================================

app.listen(PORT, async () => {
    console.log(`Application running on port ${PORT}`);

    await initializeDatabase();
});