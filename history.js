// ===================================
// DATA
// ===================================

let transactions = [];

// ===================================
// STORAGE
// ===================================

function loadTransactions() {

    const data =
        localStorage.getItem("warungkuTransactions");

    if (data) {

        transactions = JSON.parse(data);

    }

}

// ===================================
// DOM
// ===================================

const transactionList =
    document.getElementById("transactionList");


function renderTransactions() {

    transactionList.replaceChildren();

    transactions.forEach((transaction) => {

        const card =
            createTransactionCard(transaction);

        transactionList.appendChild(card);

    });

}

function createTransactionCard(transaction) {

    const card = document.createElement("div");
    card.className = "transaction-card";

    const code = document.createElement("h2");

    code.textContent =
        transaction.transactionCode;
    
    const date = document.createElement("h3");
    date.textContent = transaction.date;

    const list = document.createElement("ul");
    
    transaction.items.forEach((item) => {

        const li = document.createElement("li");

        li.textContent =
            `${item.name} ×${item.qty} - ${formatRupiah(item.price * item.qty)}`;

        list.appendChild(li);

    });

    const total = document.createElement("p");

    total.textContent =
        `Total : ${formatRupiah(transaction.total)}`;

    card.append(
        code,
        date,
        list,
        total
    );

    return card;

}

function formatRupiah(angka) {

    return "Rp " +
        angka.toLocaleString("id-ID");

}

function init() {

    loadTransactions();

    renderTransactions();

}

init();