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
// DOM ELEMENTS
// ===================================

const transactionList =
    document.getElementById("transactionList");

const transactionModal =
    document.getElementById("transactionModal");

const receiptContent =
    document.getElementById("receiptContent");

const closeModal =
    document.getElementById("closeModal");


// ===================================
// EVENT LISTENERS
// ===================================

function setupEventListeners() {

    if (closeModal) {

        closeModal.addEventListener(
            "click",
            hideModal
        );

    }

}


// ===================================
// RENDER
// ===================================

function renderTransactions() {

    transactionList.replaceChildren();

    transactions.forEach((transaction) => {

        const card =
            createTransactionCard(transaction);

        transactionList.appendChild(card);

    });

}

function renderReceipt(transaction) {

    receiptContent.replaceChildren();

    const header =
        createReceiptHeader(transaction);

    receiptContent.appendChild(header);

}


// ===================================
// CREATE ELEMENTS
// ===================================

function createTransactionCard(transaction) {

    const card =
        document.createElement("div");

    card.className =
        "transaction-card";

    card.addEventListener("click", () => {

        openTransactionDetail(transaction);

    });

    const code =
        document.createElement("h2");

    code.textContent =
        transaction.transactionCode;

    const date =
        document.createElement("h3");

    date.textContent =
        transaction.date;

    const list =
        document.createElement("ul");

    transaction.items.forEach((item) => {

        const li =
            document.createElement("li");

        li.textContent =
            `${item.name} ×${item.qty} - ${formatRupiah(item.price * item.qty)}`;

        list.appendChild(li);

    });

    const total =
        document.createElement("p");

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

function createReceiptHeader(transaction) {

    const container =
        document.createElement("div");

    const code =
        document.createElement("h2");

    code.textContent =
        transaction.transactionCode;

    const date =
        document.createElement("p");

    date.textContent =
        transaction.date;

    container.append(
        code,
        date
    );

    return container;

}


// ===================================
// MODAL
// ===================================

function openTransactionDetail(transaction) {

    renderReceipt(transaction);

    showModal();

}

function showModal() {

    transactionModal.classList.remove("hidden");

}

function hideModal() {

    transactionModal.classList.add("hidden");

}


// ===================================
// UTILITIES
// ===================================

function formatRupiah(angka) {

    return "Rp " +
        angka.toLocaleString("id-ID");

}


// ===================================
// INIT
// ===================================

function init() {

    loadTransactions();

    renderTransactions();

    setupEventListeners();

}

init();