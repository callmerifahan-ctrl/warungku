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
// UTILITIES
// ===================================
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

    const receiptDate = document.getElementById("receiptDate");
    const receiptCode = document.getElementById("receiptCode");
    const receiptItems = document.getElementById("receiptItems");
    const receiptTotal = document.getElementById("receiptTotal");
    const receiptPayment = document.getElementById("receiptPayment");
    const receiptChange = document.getElementById("receiptChange");

    if (!trxCode) {
        alert("Kode transaksi tidak ditemukan!");
        window.location.href = "history.html";
        return;
    }

    try {
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

        if (receiptCode) receiptCode.textContent = data.kode_transaksi;
        if (receiptDate) receiptDate.textContent = formatDate(data.tanggal || data.created_at);
        if (receiptTotal) receiptTotal.textContent = formatRupiah(data.total);
        if (receiptPayment) receiptPayment.textContent = formatRupiah(data.bayar);
        if (receiptChange) receiptChange.textContent = formatRupiah(data.kembalian);

        if (receiptItems) {
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
    } catch (err) {
        console.error("Critical error in loadReceipt:", err);
    }
}

loadReceipt();