// ===================================
// DATA
// ===================================

let transactions = [];

// ===================================
// DOM ELEMENTS
// ===================================

const totalRevenue =
    document.getElementById("totalRevenue");

const totalTransactions =
    document.getElementById("totalTransactions");

const totalItemsSold =
    document.getElementById("totalItemsSold");

const bestSeller =
    document.getElementById("bestSeller");

const reportList =
    document.getElementById("reportList");

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
// REPORT
// ===================================

function getTotalRevenue() {

    let total = 0;

    transactions.forEach((transaction) => {

        total += transaction.total;

    });

    return total;

}

function getTotalTransactions() {

    return transactions.length;

}

function getTotalItemsSold() {

    let total = 0;

    transactions.forEach((transaction) => {

        transaction.items.forEach((item) => {

            total += item.qty;

        });

    });

    return total;

}

function getBestSeller() {

    const products = {};

    transactions.forEach((transaction) => {

        transaction.items.forEach((item) => {

            if (!products[item.name]) {

                products[item.name] = 0;

            }

            products[item.name] += item.qty;

        });

    });

    let bestSeller = "-";
    let highest = 0;

    for (const name in products) {

        if (products[name] > highest) {

            highest = products[name];
            bestSeller = name;

        }

    }

    return bestSeller;

}

function renderReportList() {

    reportList.replaceChildren();

    transactions.forEach((transaction) => {

        const card =
            document.createElement("div");

        card.className =
            "transaction-card";

        card.addEventListener("click", () => {

            window.location.href =
                `transaction-detail.html?id=${transaction.transactionCode}&source=report`;

            });

        const code =
            document.createElement("h3");

        code.textContent =
            transaction.transactionCode;

        const date =
            document.createElement("p");

        date.textContent =
            transaction.date;

        const total =
            document.createElement("strong");

        total.textContent =
            formatRupiah(transaction.total);

        card.append(
            code,
            date,
            total
        );

        reportList.appendChild(card);

    });

}

// ===================================
// RENDER
// ===================================

function renderDashboard() {

    totalRevenue.textContent =
        formatRupiah(getTotalRevenue());

    totalTransactions.textContent =
        getTotalTransactions();

    totalItemsSold.textContent =
        getTotalItemsSold();

    bestSeller.textContent =
        getBestSeller();

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

    renderDashboard();

    renderReportList();

}

init();