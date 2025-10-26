const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

// MongoDB connection
const uri = process.env.MONGO_URI || "mongodb://localhost:27017/expenseDB";

mongoose
  .connect(uri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Define Mongoose Schema and Model
const expenseSchema = new mongoose.Schema({
  title: String,
  amount: Number,
  date: { type: Date, default: Date.now },
});

const Expense = mongoose.model("Expense", expenseSchema);

// Home route - list all expenses
app.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyExpenses = await Expense.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalMonthly = monthlyExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );

    res.render("index", { expenses, totalMonthly });
  } catch (err) {
    console.error("Error loading expenses:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Add Expense Page
app.get("/add", (req, res) => {
  res.render("addExpense");
});

// Handle Add Expense Form
app.post("/add", async (req, res) => {
  try {
    const newExpense = new Expense({
      title: req.body.title,
      amount: req.body.amount,
    });
    await newExpense.save();
    res.redirect("/");
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).send("Failed to add expense");
  }
});

// Edit Expense Page
app.get("/edit/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    res.render("editExpense", { expense });
  } catch (err) {
    console.error("Error fetching expense:", err);
    res.status(500).send("Failed to load edit page");
  }
});

// Handle Edit Form
app.post("/edit/:id", async (req, res) => {
  try {
    await Expense.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      amount: req.body.amount,
    });
    res.redirect("/");
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(500).send("Failed to update expense");
  }
});

// Delete Expense
app.get("/delete/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).send("Failed to delete expense");
  }
});

// Server setup
const PORT = process.env.PORT || 3000;
let _server = null;

function start(port = PORT) {
  return new Promise((resolve, reject) => {
    if (_server) {
      return resolve(_server);
    }
    _server = app.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${port}`);
      resolve(_server);
    });
    _server.on("error", (err) => reject(err));
  });
}

async function stop() {
  return new Promise((resolve, reject) => {
    if (!_server) return resolve();

    try {
      _server.close(async (err) => {
        if (err) return reject(err);

        // 🧹 Close MongoDB connection too
        try {
          await mongoose.connection.close();
          console.log("🧹 MongoDB connection closed.");
        } catch (dbErr) {
          console.warn("⚠️ Error closing MongoDB connection:", dbErr.message);
        }

        _server = null;
        resolve();
      });
    } catch (err) {
      if (err && err.code === "ERR_SERVER_NOT_RUNNING") {
        _server = null;
        return resolve();
      }
      return reject(err);
    }
  });
}

// Run server if executed directly
if (require.main === module) {
  start().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

module.exports = { app, start, stop };
