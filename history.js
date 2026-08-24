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
// DATA & DOM
// ===================================
let transactions = [];
const transactionList = document.getElementById("transactionList");

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
        console.error("Error fetching transactions:", error);
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

function createTransactionCard(transaction) {
    const card = document.createElement("div");
    card.className = "transaction-card";

    // TAMBAHKAN PARAMETER source=history
    card.addEventListener("click", () => {
        window.location.href = `transaction-detail.html?id=${encodeURIComponent(transaction.transactionCode)}&source=history`;
    });

    const code = document.createElement("h2");
    code.textContent = transaction.transactionCode;

    const date = document.createElement("p");
    date.textContent = transaction.date;

    const total = document.createElement("h3");
    total.textContent = formatRupiah(transaction.total);

    const itemCount = document.createElement("small");
    const totalQty = (transaction.items || []).reduce((sum, item) => sum + item.qty, 0);
    itemCount.textContent = `${transaction.items ? transaction.items.length : 0} produk • ${totalQty} item`;

    card.append(code, date, total, itemCount);
    return card;
}

// ===================================
// RENDERERS
// ===================================
function renderTransactions() {
    transactionList.replaceChildren();

    if (transactions.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Belum ada transaksi.";
        transactionList.appendChild(empty);
        return;
    }

    transactions.forEach((transaction) => {
        transactionList.appendChild(createTransactionCard(transaction));
    });
}

function createTransactionCard(transaction) {
    const card = document.createElement("div");
    card.className = "transaction-card";

    card.addEventListener("click", () => {
        window.location.href = `transaction-detail.html?id=${transaction.transactionCode}&source=history`;
    });

    const code = document.createElement("h2");
    code.textContent = transaction.transactionCode;

    const date = document.createElement("p");
    date.textContent = transaction.date;

    const total = document.createElement("h3");
    total.textContent = formatRupiah(transaction.total);

    const itemCount = document.createElement("small");
    const totalQty = transaction.items.reduce((sum, item) => sum + item.qty, 0);
    itemCount.textContent = `${transaction.items.length} produk • ${totalQty} item`;

    card.append(code, date, total, itemCount);
    return card;
}

// ===================================
// INIT
// ===================================
async function init() {
    await loadTransactionsSupabase();
    renderTransactions();
}

init();