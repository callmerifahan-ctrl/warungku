// ===================================
// DATA
// ===================================

let transactions = [];

// ===================================
// DOM
// ===================================

const transactionList =
    document.getElementById("transactionList");

// ===================================
// STORAGE
// ===================================

function loadTransactions() {

    const data =
        localStorage.getItem("warungkuTransactions");

    if (data) {

        transactions =
            JSON.parse(data);

    }

}

// ===================================
// RENDER
// ===================================

function renderTransactions() {

    transactionList.replaceChildren();

    if (transactions.length === 0) {

        const empty =
            document.createElement("p");

        empty.textContent =
            "Belum ada transaksi.";

        transactionList.appendChild(empty);

        return;

    }

    transactions
        .slice()
        .reverse()
        .forEach((transaction) => {

            const card =
                createTransactionCard(transaction);

            transactionList.appendChild(card);

        });

}

// ===================================
// CREATE ELEMENT
// ===================================

function createTransactionCard(transaction) {

    const card =
        document.createElement("div");

    card.className =
        "transaction-card";

    card.addEventListener("click", () => {

        window.location.href =
            `receipt.html?id=${transaction.transactionCode}`;

    });

    const code =
        document.createElement("h2");

    code.textContent =
        transaction.transactionCode;

    const date =
        document.createElement("p");

    date.textContent =
        transaction.date;

    const total =
        document.createElement("h3");

    total.textContent =
        formatRupiah(transaction.total);

    const itemCount =
        document.createElement("small");

    const totalQty =
        transaction.items.reduce(

            (sum, item) => sum + item.qty,

            0

        );

    itemCount.textContent =
        `${transaction.items.length} produk • ${totalQty} item`;

    card.append(

        code,

        date,

        total,

        itemCount

    );

    return card;

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

}

init();