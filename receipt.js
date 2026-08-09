// ===================================
// DATA
// ===================================

let transactions = [];
let transaction = null;

// ===================================
// DOM
// ===================================

const receiptCode =
    document.getElementById("receiptCode");

const receiptDate =
    document.getElementById("receiptDate");

const receiptItems =
    document.getElementById("receiptItems");

const receiptTotalItems =
    document.getElementById("receiptTotalItems");

const receiptTotal =
    document.getElementById("receiptTotal");

const receiptPayment =
    document.getElementById("receiptPayment");

const receiptChange =
    document.getElementById("receiptChange");

const printButton =
    document.getElementById("printButton");

const backButton =
    document.getElementById("backButton");

// ===================================
// STORAGE
// ===================================

function loadTransactions() {

    const data =
        localStorage.getItem(
            "warungkuTransactions"
        );

    if (data) {

        transactions =
            JSON.parse(data);

    }

}

// ===================================
// URL
// ===================================

function getTransactionCode() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id");

}

function findTransaction() {

    const code =
        getTransactionCode();

    transaction =
        transactions.find((item) => {

            return (
                item.transactionCode === code
            );

        });

}

function renderReceipt() {

    if (!transaction) return;

    receiptCode.textContent =
        transaction.transactionCode;

    receiptDate.textContent =
        transaction.date;

    receiptTotal.textContent =
        formatRupiah(transaction.total);

    receiptPayment.textContent =
        formatRupiah(transaction.payment);

    receiptChange.textContent =
        formatRupiah(transaction.change);

    let totalItems = 0;

    receiptItems.innerHTML = "";

    transaction.items.forEach(item => {

        totalItems += item.qty;

        const row =
            document.createElement("div");

        row.className = "receipt-item";

        row.innerHTML = `
            <span>${item.name}</span>
            <span>${item.qty} × ${formatRupiah(item.price)}</span>
            <span>${formatRupiah(item.qty * item.price)}</span>
        `;

        receiptItems.appendChild(row);

    });

    receiptTotalItems.textContent =
        totalItems;
}

// ===================================
// UTILITIES
// ===================================

function formatRupiah(angka) {

    return "Rp " +
        angka.toLocaleString("id-ID");

}

// ===================================
// EVENT
// ===================================

printButton.addEventListener(
    "click",
    () => window.print()
);

backButton.addEventListener(
    "click",
    () => {

        window.location.href =
        "cashier.html";

    }
);

// ===================================
// INIT
// ===================================

function init() {

    loadTransactions();

    findTransaction();

    renderReceipt();

    console.log(transaction);

    printButton.addEventListener("click", () => {

        window.print();

    });

}

init();