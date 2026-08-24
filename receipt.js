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
let transaction = null;

const receiptCode = document.getElementById("receiptCode");
const receiptDate = document.getElementById("receiptDate");
const receiptItems = document.getElementById("receiptItems");
const receiptTotalItems = document.getElementById("receiptTotalItems");
const receiptTotal = document.getElementById("receiptTotal");
const receiptPayment = document.getElementById("receiptPayment");
const receiptChange = document.getElementById("receiptChange");
const printButton = document.getElementById("printButton");
const backButton = document.getElementById("backButton");

function formatRupiah(angka) {
    return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}

function getTransactionCode() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// ===================================
// FETCH DATA
// ===================================
async function loadTransactionSupabase(code) {
    if (!code) return null;

    const { data, error } = await supabaseClient
        .from("transaksi")
        .select("*")
        .eq("kode_transaksi", code)
        .maybeSingle();

    if (error || !data) {
        console.error(error);
        return null;
    }

    return {
        transactionCode: data.kode_transaksi,
        date: new Date(data.tanggal).toLocaleString("id-ID"),
        items: data.item || [],
        total: data.total,
        payment: data.bayar,
        change: data.kembalian
    };
}

// ===================================
// RENDER RECEIPT
// ===================================
function renderReceipt() {
    if (!transaction) {
        receiptCode.textContent = "Transaksi tidak ditemukan";
        return;
    }

    receiptCode.textContent = transaction.transactionCode;
    receiptDate.textContent = transaction.date;
    receiptTotal.textContent = formatRupiah(transaction.total);
    receiptPayment.textContent = formatRupiah(transaction.payment);
    receiptChange.textContent = formatRupiah(transaction.change);

    let totalItemsCount = 0;
    receiptItems.replaceChildren();

    transaction.items.forEach(item => {
        totalItemsCount += item.qty;

        const row = document.createElement("div");
        row.className = "receipt-item";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = item.name;

        const qtySpan = document.createElement("span");
        qtySpan.textContent = `${item.qty} × ${formatRupiah(item.price)}`;

        const totalSpan = document.createElement("span");
        totalSpan.textContent = formatRupiah(item.qty * item.price);

        row.append(nameSpan, qtySpan, totalSpan);
        receiptItems.appendChild(row);
    });

    receiptTotalItems.textContent = totalItemsCount;
}

// ===================================
// INIT & EVENT LISTENERS
// ===================================
function setupEventListeners() {
    if (printButton) printButton.addEventListener("click", () => window.print());
    if (backButton) backButton.addEventListener("click", () => {
        window.location.href = "cashier.html";
    });
}

async function init() {
    const code = getTransactionCode();
    transaction = await loadTransactionSupabase(code);
    renderReceipt();
    setupEventListeners();
}

init();