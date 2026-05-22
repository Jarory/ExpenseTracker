// 控制月份
let currentDate = new Date();

let currentMonth =
  currentDate.getMonth();

let currentYear =
  currentDate.getFullYear();

let expenseChart;
let trendChart;
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

const form = document.getElementById("transactionForm");
const list = document.getElementById("list");

const budgetInput = document.getElementById("budgetInput");
const budgetBar = document.getElementById("budgetBar");
const budgetText = document.getElementById("budgetText");

let transactions =
  JSON.parse(localStorage.getItem("transactions")) || [];

let budget =
  Number(localStorage.getItem("budget")) || 0;

/* =========================
   初始化
========================= */

budgetInput.value = budget;

updateUI();
renderCharts();

/* =========================
   新增交易
========================= */

form.addEventListener("submit", e => {

  e.preventDefault();

  const text =
    document.getElementById("text").value;

  const amount =
    Number(document.getElementById("amount").value);

  const category =
    document.getElementById("category").value;

  const type =
    document.getElementById("type").value;

  const transaction = {

  id:Date.now(),

  text,
  amount,
  category,
  type,

  date:new Date()

};

  transactions.push(transaction);

  saveData();

  updateUI();

  form.reset();

});

/* =========================
   更新畫面
========================= */

function updateUI(){

  updateMonthDisplay();

  list.innerHTML = "";

  const filteredTransactions =
  transactions.filter(transaction => {

    const date =
      new Date(transaction.date);

    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );

});

  let incomeTotal = 0;
  let expenseTotal = 0;

  filteredTransactions.forEach(transaction => {
    const li = document.createElement("li");

    li.classList.add("transaction");

    li.innerHTML = `

  <div class="transaction-left">

    <span class="transaction-title">
      ${transaction.text}
    </span>

    <span class="transaction-category">
      ${transaction.category}
    </span>

  </div>

  <div style="display:flex;align-items:center;">

    <div class="transaction-amount
      ${transaction.type === "income"
        ? "plus"
        : "minus"}">

      ${transaction.type === "income"
        ? "+"
        : "-"}

      $${transaction.amount}

    </div>

    <button
      class="delete-btn"
      onclick="deleteTransaction(${transaction.id})">

      ✕
    </button>

  </div>

`;

    list.prepend(li);

    if(transaction.type === "income"){
      incomeTotal += transaction.amount;
    }else{
      expenseTotal += transaction.amount;
    }

  });

  const total = incomeTotal - expenseTotal;

  balance.textContent =
    `$${total}`;

  income.textContent =
    `$${incomeTotal}`;

  expense.textContent =
    `$${expenseTotal}`;

  updateBudget(expenseTotal);
  renderCharts();

}

/* =========================
   預算功能
========================= */

budgetInput.addEventListener("input", () => {

  budget = Number(budgetInput.value);

  localStorage.setItem("budget", budget);

  updateUI();

});

function updateBudget(expenseTotal){

  if(budget <= 0){

    budgetBar.style.width = "0%";

    budgetText.textContent =
      "請設定本月預算";

    return;

  }

  const percent =
    Math.min(
      (expenseTotal / budget) * 100,
      100
    );

  budgetBar.style.width =
    `${percent}%`;

  budgetText.textContent =
    `已使用 ${percent.toFixed(0)}%`;

  if(percent >= 80 && percent < 100){

    budgetText.textContent +=
      " ⚠️ 即將超支";

  }

  if(percent >= 100){

    budgetText.textContent =
      "🚨 已超出預算";

  }

}

/* =========================
   儲存資料
========================= */

function saveData(){

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );

}

/* =========================
   圖表
========================= */

function renderCharts(){

  /* =========================
     篩選當前月份資料
  ========================= */

  const filteredTransactions =
    transactions.filter(transaction => {

      const date =
        new Date(transaction.date);

      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );

    });

  /* =========================
     支出分類統計
  ========================= */

  const categoryData = {};

  filteredTransactions.forEach(transaction => {

    if(transaction.type === "expense"){

      if(!categoryData[transaction.category]){
        categoryData[transaction.category] = 0;
      }

      categoryData[transaction.category] += transaction.amount;

    }

  });

  const expenseCtx =
    document.getElementById("expenseChart");

  if(expenseChart){
    expenseChart.destroy();
  }

  expenseChart = new Chart(expenseCtx, {

    type:"doughnut",

    data:{

      labels:Object.keys(categoryData),

      datasets:[{

        data:Object.values(categoryData),

        borderWidth:0

      }]

    },

    options:{

      responsive:true,

      plugins:{

        legend:{
          labels:{
            color:"white"
          }
        }

      }

    }

  });

  /* =========================
     收支趨勢
  ========================= */

  const trendLabels = [];
  const trendData = [];

  filteredTransactions.forEach(transaction => {

    trendLabels.push(transaction.text);

    trendData.push(
      transaction.type === "expense"
        ? -transaction.amount
        : transaction.amount
    );

  });

  const trendCtx =
    document.getElementById("trendChart");

  if(trendChart){
    trendChart.destroy();
  }

  trendChart = new Chart(trendCtx, {

    type:"line",

    data:{

      labels:trendLabels,

      datasets:[{

        label:"收支變化",

        data:trendData,

        tension:.4,

        fill:true

      }]

    },

    options:{

      responsive:true,

      plugins:{

        legend:{
          labels:{
            color:"white"
          }
        }

      },

      scales:{

        x:{
          ticks:{
            color:"white"
          }
        },

        y:{
          ticks:{
            color:"white"
          }
        }

      }

    }

  });

}

/* =========================
   刪除單筆
========================= */

function deleteTransaction(id){

  transactions =
    transactions.filter(
      transaction =>
        transaction.id !== id
    );

  saveData();

  updateUI();

}

/* =========================
   清除全部
========================= */

const clearAllBtn =
  document.getElementById("clearAllBtn");

clearAllBtn.addEventListener("click", () => {

  const confirmClear =
    confirm("確定要清除全部資料嗎？");

  if(!confirmClear) return;

  transactions = [];

  saveData();

  updateUI();

});

/* ========================================
   月份顯示
======================================== */

function updateMonthDisplay(){

  const monthText =
    document.getElementById(
      "currentMonth"
    );

  monthText.textContent =
    `${currentYear} / ${
      String(currentMonth + 1)
      .padStart(2,"0")
    }`;

}

/* ========================================
   切換月份
======================================== */

document
.getElementById("prevMonth")
.addEventListener("click", () => {

  currentMonth--;

  if(currentMonth < 0){
    currentMonth = 11;
    currentYear--;
  }

  updateUI();

});

document
.getElementById("nextMonth")
.addEventListener("click", () => {

  currentMonth++;

  if(currentMonth > 11){
    currentMonth = 0;
    currentYear++;
  }

  updateUI();

});