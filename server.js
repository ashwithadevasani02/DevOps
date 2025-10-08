const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/expenseDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const expenseSchema = new mongoose.Schema({
    title: String,
    amount: Number,
    date: { type: Date, default: Date.now }
});
const Expense = mongoose.model("Expense", expenseSchema);
app.get("/", async (req, res) => {
    const expenses = await Expense.find();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyExpenses = await Expense.find({
        date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalMonthly = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.render("index", { expenses: expenses, totalMonthly: totalMonthly });
});


app.get("/add", (req, res) => {
    res.render("addExpense");
});

app.post("/add", async (req, res) => {
    const newExpense = new Expense({
        title: req.body.title,
        amount: req.body.amount
    });
    await newExpense.save();
    res.redirect("/");
});
// Edit Expense Page
app.get("/edit/:id", async (req, res) => {
    const expense = await Expense.findById(req.params.id);
    res.render("editExpense", { expense: expense });
});

// Handle Edit Form
app.post("/edit/:id", async (req, res) => {
    await Expense.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        amount: req.body.amount
    });
    res.redirect("/");
});

// Delete Expense
app.get("/delete/:id", async (req, res) => {
    await Expense.findByIdAndDelete(req.params.id);
    res.redirect("/");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
