// ===================================
// CONFIG & SUPABASE SETUP
// ===================================
const SUPABASE_URL = "https://dyyzsuleugpgiqutebwv.supabase.co";
const SUPABASE_KEY = "sb_publishable_hKWVFsDZC539-T3nVyS13g_ME3HC0AP";

let supabaseClient = null;

if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
} else {
    console.error("Library Supabase belum terload di HTML!");
}

// ===================================
// HELPER FUNCTIONS
// ===================================
function formatRupiah(value) {
    return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get("id"),
        source: params.get("source")
    };
}

// ===================================
// FETCH DATA FROM SUPABASE
// ===================================
async function fetchTransactionFromSupabase(code) {
    if (!code || !supabaseClient) return null;

    const { data, error } = await supabaseClient
        .from("transaksi")
        .select("*")
        .eq("kode_transaksi", code)
        .maybeSingle();

    if (error || !data) {
        console.error("Error/Data tidak ditemukan:", error);
        return null;
    }

    return {
        transactionCode: data.kode_transaksi,
        date: data.tanggal ? new Date(data.tanggal).toLocaleString("id-ID") : (data.created_at ? new Date(data.created_at).toLocaleString("id-ID") : "-"),
        items: data.item || [],
        total: data.total,
        payment: data.bayar,
        change: data.kembalian
    };
}

// ===================================
// RENDER DETAIL
// ===================================
function renderTransactionDetail(transaction) {
    const transactionCodeEl = document.getElementById("transactionCode");
    const transactionDateEl = document.getElementById("transactionDate");
    const transactionItemsEl = document.getElementById("transactionItems");
    const totalItemsEl = document.getElementById("totalItems");
    const transactionTotalEl = document.getElementById("transactionTotal");
    const transactionPaymentEl = document.getElementById("transactionPayment");
    const transactionChangeEl = document.getElementById("transactionChange");

    if (!transaction) {
        if (transactionCodeEl) transactionCodeEl.textContent = "Data tidak ditemukan!";
        return;
    }

    if (transactionCodeEl) transactionCodeEl.textContent = transaction.transactionCode;
    if (transactionDateEl) transactionDateEl.textContent = transaction.date;

    if (transactionItemsEl) {
        transactionItemsEl.replaceChildren();
        let itemTotalCount = 0;

        transaction.items.forEach((item) => {
            const qty = Number(item.qty || 0);
            const price = Number(item.price || 0);
            itemTotalCount += qty;

            const row = document.createElement("div");
            row.className = "detail-item";

            const name = document.createElement("span");
            name.textContent = item.name;

            const quantity = document.createElement("span");
            quantity.textContent = `${qty} × ${formatRupiah(price)}`;

            const subtotal = document.createElement("strong");
            subtotal.textContent = formatRupiah(qty * price);

            row.append(name, quantity, subtotal);
            transactionItemsEl.appendChild(row);
        });

        if (totalItemsEl) totalItemsEl.textContent = itemTotalCount;
    }

    if (transactionTotalEl) transactionTotalEl.textContent = formatRupiah(transaction.total);
    if (transactionPaymentEl) transactionPaymentEl.textContent = formatRupiah(transaction.payment);
    if (transactionChangeEl) transactionChangeEl.textContent = formatRupiah(transaction.change);
}

// ===================================
// INIT & EVENT LISTENERS
// ===================================
async function init() {
    const { id, source } = getUrlParams();

    const backButton = document.getElementById("backButton");
    if (backButton) {
        backButton.addEventListener("click", () => {
            if (source === "report") {
                window.location.href = "report.html";
            } else {
                window.location.href = "history.html";
            }
        });
    }

    const transaction = await fetchTransactionFromSupabase(id);
    renderTransactionDetail(transaction);
}

document.addEventListener("DOMContentLoaded", init);