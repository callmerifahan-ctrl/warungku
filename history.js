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

function showToast(message) {
    const toast = document.getElementById("toast");
    if (toast) {
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    } else {
        alert(message);
    }
}

// ===================================
// LOAD & RENDER HISTORY
// ===================================
// ===================================
// LOAD & RENDER HISTORY
// ===================================
async function loadHistory() {
    const transactionList = document.getElementById("transactionList");
    if (!transactionList) return;

    try {
        // Menggunakan kolom 'tanggal' (bukan created_at)
        const { data, error } = await supabaseClient
            .from("transaksi")
            .select("*")
            .order("tanggal", { ascending: false });

        if (error) {
            console.error("Supabase Error Details:", error);
            showToast("Gagal memuat riwayat transaksi!");
            return;
        }

        renderHistory(data || []);
    } catch (err) {
        console.error("JavaScript Error Details:", err);
        showToast("Terjadi kesalahan pada aplikasi!");
    }
}

function renderHistory(transactions) {
    const transactionList = document.getElementById("transactionList");
    const searchInput = document.getElementById("searchInput");
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";

    transactionList.replaceChildren();

    const filtered = transactions.filter(trx => 
        (trx.kode_transaksi || "").toLowerCase().includes(keyword)
    );

    if (filtered.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.style.textAlign = "center";
        emptyMsg.style.color = "var(--text-muted)";
        emptyMsg.style.padding = "20px 0";
        emptyMsg.textContent = keyword ? "Transaksi tidak ditemukan." : "Belum ada riwayat transaksi.";
        transactionList.appendChild(emptyMsg);
        return;
    }

    filtered.forEach(trx => {
        const card = document.createElement("div");
        card.className = "item-card";
        card.style.background = "#fff";
        card.style.padding = "16px";
        card.style.marginBottom = "12px";
        card.style.borderRadius = "10px";
        card.style.boxShadow = "0 2px 6px rgba(0,0,0,0.06)";
        card.style.cursor = "pointer";

        card.addEventListener("click", () => {
            window.location.href = `receipt.html?id=${trx.kode_transaksi}`;
        });

        const headerDiv = document.createElement("div");
        headerDiv.style.display = "flex";
        headerDiv.style.justifyContent = "space-between";
        headerDiv.style.alignItems = "center";

        const codeTitle = document.createElement("h3");
        codeTitle.style.margin = "0";
        codeTitle.style.fontSize = "16px";
        codeTitle.textContent = trx.kode_transaksi;

        const totalAmount = document.createElement("strong");
        totalAmount.style.color = "var(--primary)";
        totalAmount.style.fontSize = "16px";
        totalAmount.textContent = formatRupiah(trx.total);

        headerDiv.append(codeTitle, totalAmount);

        const dateText = document.createElement("p");
        dateText.style.margin = "6px 0 0 0";
        dateText.style.fontSize = "13px";
        dateText.style.color = "var(--text-muted)";
        // Menggunakan properti trx.tanggal
        dateText.textContent = formatDate(trx.tanggal);

        card.append(headerDiv, dateText);
        transactionList.appendChild(card);
    });
}

// ===================================
// INITIALIZATION
// ===================================
function init() {
    // Unregister PWA Service Worker lama
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                registration.unregister();
            }
        });
    }

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", () => loadHistory());
    }

    loadHistory();
}

init();