// ===================================
// CONFIG & SUPABASE SETUP
// ===================================
const SUPABASE_URL = "https://dyyzsuleugpgiqutebwv.supabase.co";
const SUPABASE_KEY = "sb_publishable_hKWVFsDZC539-T3nVyS13g_ME3HC0AP";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

// ===================================
// DOM ELEMENTS & UTILITIES
// ===================================
const receiptDate = document.getElementById("receiptDate");
const receiptCode = document.getElementById("receiptCode");
const receiptItems = document.getElementById("receiptItems");
const receiptTotal = document.getElementById("receiptTotal");
const receiptPayment = document.getElementById("receiptPayment");
const receiptChange = document.getElementById("receiptChange");

const btnPrint = document.getElementById("btnPrint");
const btnBack = document.getElementById("btnBack");

function formatRupiah(angka) {
    return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}

function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ===================================
// LOAD TRANSACTION DETAIL
// ===================================
async function loadReceipt() {
    const urlParams = new URLSearchParams(window.location.search);
    const trxCode = urlParams.get("id");

    if (!trxCode) {
        alert("Kode transaksi tidak ditemukan!");
        window.location.href = "history.html";
        return;
    }

    const { data, error } = await supabaseClient
        .from("transaksi")
        .select("*")
        .eq("kode_transaksi", trxCode)
        .single();

    if (error || !data) {
        console.error(error);
        alert("Transaksi tidak ditemukan!");
        window.location.href = "history.html";
        return;
    }

    receiptCode.textContent = data.kode_transaksi;
    receiptDate.textContent = formatDate(data.created_at);
    receiptTotal.textContent = formatRupiah(data.total);
    receiptPayment.textContent = formatRupiah(data.bayar);
    receiptChange.textContent = formatRupiah(data.kembalian);

    receiptItems.replaceChildren();
    const items = Array.isArray(data.item) ? data.item : [];
    items.forEach(item => {
        const itemRow = document.createElement("div");
        itemRow.style.display = "flex";
        itemRow.style.justifyContent = "space-between";
        itemRow.style.margin = "6px 0";

        const titleSpan = document.createElement("span");
        titleSpan.textContent = `${item.name} x${item.qty}`;

        const priceSpan = document.createElement("span");
        priceSpan.textContent = formatRupiah(item.price * item.qty);

        itemRow.append(titleSpan, priceSpan);
        receiptItems.appendChild(itemRow);
    });
}

// ===================================
// EVENT LISTENERS
// ===================================
btnPrint.addEventListener("click", () => {
    window.print();
});

btnBack.addEventListener("click", () => {
    window.location.href = "cashier.html";
});

loadReceipt();