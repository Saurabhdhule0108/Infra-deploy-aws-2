const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = 8080;

app.use(express.json());

// Serve frontend files from public/
app.use(express.static(path.join(__dirname, "public")));

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
// INITIALIZE DATABASE
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
        console.error("Database health check failed:", error.message);

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
            [name.trim(), email.trim()]
        );

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: result.insertId,
                name: name.trim(),
                email: email.trim()
            }
        });
    } catch (error) {
        console.error("Create user error:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

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
// GET ONE USER
// =========================================================

app.get("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await pool.execute(
            "SELECT id, name, email, created_at FROM users WHERE id = ?",
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(users[0]);
    } catch (error) {
        console.error("Get user error:", error.message);

        res.status(500).json({
            message: "Failed to retrieve user"
        });
    }
});

// =========================================================
// UPDATE USER
// =========================================================

app.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "name and email are required"
            });
        }

        const [result] = await pool.execute(
            "UPDATE users SET name = ?, email = ? WHERE id = ?",
            [name.trim(), email.trim(), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User updated successfully",
            user: {
                id: Number(id),
                name: name.trim(),
                email: email.trim()
            }
        });
    } catch (error) {
        console.error("Update user error:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        res.status(500).json({
            message: "Failed to update user"
        });
    }
});

// =========================================================
// DELETE USER
// =========================================================

app.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute(
            "DELETE FROM users WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User deleted successfully",
            id: Number(id)
        });
    } catch (error) {
        console.error("Delete user error:", error.message);

        res.status(500).json({
            message: "Failed to delete user"
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