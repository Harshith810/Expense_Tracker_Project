const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// DB CONNECTION
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Harshu@7705",
  database: "expense_tracker"
};

let pool;

(async () => {
  try {
    pool = await mysql.createPool(dbConfig);
    console.log("Connected to MySQL database!");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

// ===============================
// REGISTER USER
// ===============================
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "All fields required" });

  try {
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashed]
    );

    res.json({ success: true });

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Username already exists" });
    }
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// LOGIN USER
// ===============================
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "All fields required" });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username=?",
      [username]
    );

    if (rows.length === 0)
      return res.status(400).json({ error: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ error: "Invalid credentials" });

    res.json({
      success: true,
      userId: user.id,
      username: user.username
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// GET EXPENSES (only logged user's)
// ===============================
app.get("/api/expenses", async (req, res) => {
  const user_id = req.query.user_id;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM expenses WHERE user_id=? ORDER BY id DESC",
      [user_id]
    );
    res.json(rows);

  } catch (err) {
    console.error("GET error:", err);
    res.status(500).json({ error: "Failed to load expenses" });
  }
});

// ===============================
// ADD EXPENSE (with user_id)
// ===============================
app.post("/api/expenses", async (req, res) => {
  const { name, amount, category, user_id } = req.body;

  try {
    await pool.query(
      "INSERT INTO expenses (name, amount, category, user_id) VALUES (?, ?, ?, ?)",
      [name, amount, category, user_id]
    );

    res.status(201).json({ success: true });

  } catch (err) {
    console.error("POST error:", err);
    res.status(500).json({ error: "Failed to save expense" });
  }
});

// ===============================
// DELETE EXPENSE (user protected)
// ===============================
app.delete("/api/expenses/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query;

  try {
    await pool.query(
      "DELETE FROM expenses WHERE id=? AND user_id=?",
      [id, user_id]
    );
    res.json({ success: true });

  } catch (err) {
    console.error("DELETE error:", err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// ===============================
// UPDATE EXPENSE
// ===============================
app.put("/api/expenses/:id", async (req, res) => {
  const { id } = req.params;
  const { name, amount, category, user_id } = req.body;

  try {
    await pool.query(
      "UPDATE expenses SET name=?, amount=?, category=? WHERE id=? AND user_id=?",
      [name, amount, category, id, user_id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error("UPDATE error:", err);
    res.status(500).json({ error: "Failed to update expense" });
  }
});

// SERVER START
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


