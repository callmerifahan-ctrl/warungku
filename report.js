// ===================================
// CONFIG & SUPABASE SETUP
// ===================================
const SUPABASE_URL = "https://dyyzsuleugpgiqutebwv.supabase.co";
const SUPABASE_KEY = "sb_publishable_hKWVFsDZC539-T3nVyS13g_ME3HC0AP";

// Tambahkan opsi auth ini agar Supabase tidak menyentuh Storage browser
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

// ===================================
// DATA STATE & DOM
// ===================================
let transactions = [];

const totalRevenue = document.getElementById("totalRevenue");
const totalTransactions = document.getElementById("totalTransactions");
const totalItemsSold = document.getElementById("totalItemsSold");
const bestSeller = document.getElementById("bestSeller");
const reportList = document.getElementById("reportList");

function formatRupiah(angka) {
    return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}

// ===================================
// FETCH TRANSACTIONS
// ===================================
async function loadTransactionsSupabase() {
    const { data, error } = await supabaseClient
        .from("transaksi")
        .select("*")
        .order("tanggal", { ascending: false });

    if (error) {
        console.error("Error fetching transactions for report:", error);
        return;
    }

    transactions = (data || []).map(item => ({
        transactionCode: item.kode_transaksi,
        date: new Date(item.tanggal).toLocaleString("id-ID"),
        items: item.item || [],
        total: item.total,
        payment: item.bayar,
        change: item.kembalian
    }));
}

// ===================================
// CALCULATIONS & RENDER
// ===================================
function getTotalRevenue() {
    return transactions.reduce((sum, t) => sum + (t.total || 0), 0);
}

function getTotalTransactions() {
    return transactions.length;
}

function getTotalItemsSold() {
    return transactions.reduce((sum, t) => {
        return sum + t.items.reduce((itemSum, item) => itemSum + (item.qty || 0), 0);
    }, 0);
}

function getBestSeller() {
    const products = {};

    transactions.forEach((transaction) => {
        transaction.items.forEach((item) => {
            products[item.name] = (products[item.name] || 0) + item.qty;
        });
    });

    let bestSellerName = "-";
    let highest = 0;

    for (const name in products) {
        if (products[name] > highest) {
            highest = products[name];
            bestSellerName = name;
        }
    }

    return bestSellerName;
}

function renderReportList() {
    reportList.replaceChildren();

    transactions.forEach((transaction) => {
        const card = document.createElement("div");
        card.className = "transaction-card";
        card.addEventListener("click", () => {
            window.location.href = `transaction-detail.html?id=${transaction.transactionCode}&source=report`;
        });

        const code = document.createElement("h3");
        code.textContent = transaction.transactionCode;

        const date = document.createElement("p");
        date.textContent = transaction.date;

        const total = document.createElement("strong");
        total.textContent = formatRupiah(transaction.total);

        card.append(code, date, total);
        reportList.appendChild(card);
    });
}

function renderDashboard() {
    totalRevenue.textContent = formatRupiah(getTotalRevenue());
    totalTransactions.textContent = getTotalTransactions();
    totalItemsSold.textContent = getTotalItemsSold();
    bestSeller.textContent = getBestSeller();
}

// ===================================
// INIT
// ===================================
async function init() {
    await loadTransactionsSupabase();
    renderDashboard();
    renderReportList();
}

init();