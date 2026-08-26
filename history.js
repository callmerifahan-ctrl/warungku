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
// DATA STATE & DOM ELEMENTS
// ===================================
let transactions = [];
const transactionList = document.getElementById("transactionList");
const searchInput = document.getElementById("searchInput");

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
// DATABASE OPERATIONS
// ===================================
async function loadTransactions() {
    const { data, error } = await supabaseClient
        .from("transaksi")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error loading transactions:", error);
        alert("Gagal memuat riwayat transaksi!");
        return;
    }

    transactions = data || [];
    renderTransactions();
}

// ===================================
// RENDERERS
// ===================================
function renderTransactions() {
    transactionList.replaceChildren();
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const filtered = transactions.filter(trx => 
        (trx.kode_transaksi || "").toLowerCase().includes(keyword)
    );

    if (filtered.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.style.textAlign = "center";
        emptyMsg.style.color = "var(--text-muted)";
        emptyMsg.textContent = "Tidak ada riwayat transaksi.";
        transactionList.appendChild(emptyMsg);
        return;
    }

    filtered.forEach(trx => {
        const card = createTransactionCard(trx);
        transactionList.appendChild(card);
    });
}

function createTransactionCard(trx) {
    const card = document.createElement("div");
    card.className = "transaction-card";
    
    // Redirect ke halaman detail / receipt saat diklik
    card.addEventListener("click", () => {
        window.location.href = `receipt.html?id=${trx.kode_transaksi}`;
    });

    const headerRow = document.createElement("div");
    headerRow.style.display = "flex";
    headerRow.style.justifyContent = "space-between";
    headerRow.style.alignItems = "center";

    const title = document.createElement("h3");
    title.style.margin = "0";
    title.textContent = trx.kode_transaksi;

    const date = document.createElement("small");
    date.style.color = "var(--text-muted)";
    date.textContent = formatDate(trx.created_at);

    headerRow.append(title, date);

    const itemsUl = document.createElement("ul");
    itemsUl.style.margin = "10px 0";
    itemsUl.style.paddingLeft = "20px";

    const items = Array.isArray(trx.item) ? trx.item : [];
    items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name} (${item.qty}x) - ${formatRupiah(item.price * item.qty)}`;
        itemsUl.appendChild(li);
    });

    const total = document.createElement("p");
    total.style.margin = "8px 0 0";
    total.style.fontWeight = "bold";
    total.style.color = "var(--primary)";
    total.textContent = `Total: ${formatRupiah(trx.total)}`;

    card.append(headerRow, itemsUl, total);
    return card;
}

// ===================================
// INITIALIZATION
// ===================================
function setupEventListeners() {
    if (searchInput) {
        searchInput.addEventListener("input", renderTransactions);
    }
}

async function init() {
    await loadTransactions();
    setupEventListeners();
}

init();