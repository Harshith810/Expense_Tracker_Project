// ============================
// FRONTEND - MULTI USER SUPPORT
// ============================

let allExpenses = [];
let editingId = null;
let currentuser = null;

const BASE = "http://localhost:5000";
const EXP_API = `${BASE}/api/expenses`;
const AUTH_REGISTER = `${BASE}/api/register`;
const AUTH_LOGIN = `${BASE}/api/login`;

// ----------------------------
// SHOW / HIDE PAGES
// ----------------------------
function showLoginPage() {
  document.getElementById("loginPage").style.display = "block";
  document.getElementById("expensepage").style.display = "none";
}

function showExpensePage() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("expensepage").style.display = "block";
}

// ----------------------------
// REGISTER USER
// ----------------------------
async function registerUser() {
  const username = document.getElementById("loginUserName").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password)
    return alert("Enter username & password");

  const res = await fetch(AUTH_REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (data.success) alert("Registered Successfully! You can login now.");
  else alert(data.error);
}

// ----------------------------
// LOGIN USER
// ----------------------------
async function loginUser() {
  const username = document.getElementById("loginUserName").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password)
    return alert("Enter username & password");

  const res = await fetch(AUTH_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.success) {
    localStorage.setItem("currentuser", data.username);
    localStorage.setItem("user_id", data.userId);
    showExpensePage();
    loadExpenses();
  } else {
    alert(data.error);
  }
}

// ----------------------------
// LOGOUT USER
// ----------------------------
function logoutUser() {
  localStorage.removeItem("currentuser");
  localStorage.removeItem("user_id");
  showLoginPage();
}

// ----------------------------
// LOAD EXPENSES (User Specific)
// ----------------------------
async function loadExpenses() {
  const userId = localStorage.getItem("user_id");

  const res = await fetch(`${EXP_API}?user_id=${userId}`);
  const data = await res.json();

  allExpenses = data;
  renderExpenses();
}

// ----------------------------
// ADD OR UPDATE EXPENSE
// ----------------------------
async function addOrUpdateExpense() {
  const name = document.getElementById("expensename").value.trim();
  const amount = document.getElementById("expenseamount").value.trim();
  const category = document.getElementById("expensecategory").value;
  const userId = localStorage.getItem("user_id");

  if (!name || !amount || category === "Select the category")
    return alert("Fill all fields");

  const payload = { name, amount, category, user_id: userId };

  if (editingId) {
    await fetch(`${EXP_API}/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    editingId = null;
  } else {
    await fetch(EXP_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  // Reset inputs
  document.getElementById("expensename").value = "";
  document.getElementById("expenseamount").value = "";
  document.getElementById("expensecategory").value = "Select the category";

  loadExpenses();
}

// ----------------------------
// DELETE EXPENSE
// ----------------------------
async function deleteExpense(id) {
  const userId = localStorage.getItem("user_id");

  await fetch(`${EXP_API}/${id}?user_id=${userId}`, {
    method: "DELETE"
  });

  loadExpenses();
}

// ----------------------------
// EDIT EXPENSE
// ----------------------------
function editExpense(id) {
  const exp = allExpenses.find(e => e.id === id);
  editingId = id;

  document.getElementById("expensename").value = exp.name;
  document.getElementById("expenseamount").value = exp.amount;
  document.getElementById("expensecategory").value = exp.category;
}

// ----------------------------
// RENDER EXPENSE LIST
// ----------------------------
function renderExpenses() {
  const list = document.getElementById("expenseList");
  list.innerHTML = "";
  let total = 0;

  allExpenses.forEach(exp => {
    total += Number(exp.amount);

    list.innerHTML += `
      <tr>
        <td>${exp.name}</td>
        <td>${exp.amount}</td>
        <td>${exp.category}</td>
        <td>
          <button onclick="editExpense(${exp.id})" class="btn btn-warning btn-sm">Edit</button>
          <button onclick="deleteExpense(${exp.id})" class="btn btn-danger btn-sm">Delete</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("totalExpense").textContent = total;
}

// ----------------------------
// PAGE LOAD HANDLER
// ----------------------------
window.onload = () => {
  const saved = localStorage.getItem("currentuser");

  if (saved) {
    showExpensePage();
    loadExpenses();
  } else {
    showLoginPage();
  }

  // Button Listeners
  document.getElementById("login").onclick = loginUser;
  document.getElementById("register").onclick = registerUser;
  document.getElementById("logout").onclick = logoutUser;
  document.getElementById("addExpense").onclick = addOrUpdateExpense;
};


