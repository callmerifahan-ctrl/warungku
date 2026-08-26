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
// DATA & CONSTANTS
// ===================================
let items = [];
let editingIndex = -1;
let activeCategory = "Semua";
let html5QrCode = null;

const PREFIX_MAP = {
    Minuman: "MNM",
    Makanan: "MKN",
    Snack: "SNK",
    Bumbu: "BMB",
    Kebersihan: "KBS",
    Perawatan: "PWT",
    ATK: "ATK"
};

const CATEGORY_ICONS = {
    Semua: "📦",
    Minuman: "🥤",
    Makanan: "🍜",
    Snack: "🍪",
    Bumbu: "🧂",
    Kebersihan: "🧼",
    Perawatan: "🧴",
    ATK: "✏️"
};

// ===================================
// DOM ELEMENTS
// ===================================
const itemNameInput = document.getElementById("itemName");
const itemStockInput = document.getElementById("itemStock");
const buyPriceInput = document.getElementById("buyPrice");
const sellPriceInput = document.getElementById("sellPrice");
const categorySelect = document.getElementById("category");
const scannedBarcodeInput = document.getElementById("scannedBarcode");

const btnTambah = document.getElementById("btnTambah");
const exportButton = document.getElementById("exportButton");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const itemList = document.getElementById("itemList");
const totalItems = document.getElementById("totalItems");

const dashboardTotalBarang = document.getElementById("dashboardTotalBarang");
const dashboardTotalStok = document.getElementById("dashboardTotalStok");
const dashboardStokMenipis = document.getElementById("dashboardStokMenipis");
const dashboardBarangHabis = document.getElementById("dashboardBarangHabis");

const dashboardDetail = document.getElementById("dashboardDetail");
const dashboardDetailTitle = document.getElementById("dashboardDetailTitle");
const dashboardDetailList = document.getElementById("dashboardDetailList");

const cardStokMenipis = document.getElementById("cardStokMenipis");
const cardBarangHabis = document.getElementById("cardBarangHabis");
const categoryContainer = document.getElementById("categoryContainer");
const toast = document.getElementById("toast");

const btnScanBarcode = document.getElementById("btnScanBarcode");
const btnCloseScanner = document.getElementById("btnCloseScanner");
const scannerModal = document.getElementById("scannerModal");

const barcodeModal = document.getElementById("barcodeModal");
const barcodeSvg = document.getElementById("barcodeSvg");
const barcodeItemName = document.getElementById("barcodeItemName");
const barcodeItemPrice = document.getElementById("barcodeItemPrice");
const btnCloseBarcode = document.getElementById("btnCloseBarcode");
const btnPrintBarcode = document.getElementById("btnPrintBarcode");

// ===================================
// UTILITIES & HELPERS
// ===================================
function formatRupiah(angka) {
    return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}

function showToast(message, type = "success") {
    if (!toast) return;
    toast.textContent = message;
    toast.className = "toast";

    if (type === "success") toast.style.background = "var(--success)";
    if (type === "warning") toast.style.background = "var(--warning)";
    if (type === "danger") toast.style.background = "var(--danger)";

    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

function getItemById(id) {
    return items.find(item => item.id === id);
}

function generateItemCode(category) {
    const prefix = PREFIX_MAP[category] || "BRG";
    const categoryCodes = items
        .filter(item => item.category === category)
        .map(item => {
            const number = item.code?.replace(prefix, "");
            return parseInt(number, 10) || 0;
        });

    const lastNumber = categoryCodes.length > 0 ? Math.max(...categoryCodes) : 0;
    return prefix + String(lastNumber + 1).padStart(4, "0");
}

function resetForm() {
    itemNameInput.value = "";
    itemStockInput.value = "";
    buyPriceInput.value = "";
    sellPriceInput.value = "";
    categorySelect.value = "Minuman";

    if (scannedBarcodeInput) scannedBarcodeInput.value = "";
    editingIndex = -1;
    if (btnTambah) btnTambah.textContent = "Tambah Barang";
    itemNameInput.focus();
}

function refreshUI() {
    renderItems();
}

// ===================================
// DATABASE OPERATIONS (SUPABASE)
// ===================================
async function loadDataSupabase() {
    const { data, error } = await supabaseClient
        .from("barang")
        .select("*")
        .order("id");

    if (error) {
        console.error("Error memuat barang:", error);
        showToast("Gagal memuat data barang!", "danger");
        return;
    }

    items = (data || []).map(item => ({
        id: item.id,
        name: item.nama,
        stock: item.stok,
        buyPrice: item.harga_beli,
        sellPrice: item.harga_jual,
        category: item.kategori,
        code: item.barcode
    }));
}

async function addItem() {
    const itemName = itemNameInput.value.trim();
    const itemStock = parseInt(itemStockInput.value, 10);
    const itemBuyPrice = parseInt(buyPriceInput.value, 10);
    const itemSellPrice = parseInt(sellPriceInput.value, 10);
    const itemCategory = categorySelect.value;

    if (!itemName) return showToast("Nama barang wajib diisi!", "warning");
    if (isNaN(itemStock)) return showToast("Stok barang wajib diisi!", "warning");
    if (isNaN(itemBuyPrice)) return showToast("Harga beli wajib diisi!", "warning");
    if (isNaN(itemSellPrice)) return showToast("Harga jual wajib diisi!", "warning");

    if (editingIndex === -1) {
        const scannedCode = scannedBarcodeInput ? scannedBarcodeInput.value.trim() : "";
        const newItem = {
            nama: itemName,
            stok: itemStock,
            harga_beli: itemBuyPrice,
            harga_jual: itemSellPrice,
            kategori: itemCategory,
            barcode: scannedCode || generateItemCode(itemCategory)
        };

        const { error } = await supabaseClient.from("barang").insert([newItem]);
        if (error) {
            console.error("ERROR INSERT:", error);
            return showToast("Gagal menyimpan barang!", "danger");
        }
        showToast("Barang berhasil ditambahkan!", "success");
    } else {
        const updatedItem = {
            nama: itemName,
            stok: itemStock,
            harga_beli: itemBuyPrice,
            harga_jual: itemSellPrice,
            kategori: itemCategory
        };

        const { error } = await supabaseClient
            .from("barang")
            .update(updatedItem)
            .eq("id", items[editingIndex].id);

        if (error) {
            console.error("ERROR UPDATE:", error);
            return showToast("Gagal memperbarui barang!", "danger");
        }
        showToast("Barang berhasil diubah!", "success");
    }

    await loadDataSupabase();
    refreshUI();
    resetForm();
}

// ===================================
// RENDERERS
// ===================================
function renderItems() {
    const keyword = searchInput.value.toLowerCase();
    itemList.replaceChildren();

    let filteredItems = items;
    if (activeCategory !== "Semua") {
        filteredItems = items.filter(item => item.category === activeCategory);
    }

    filteredItems.forEach((item) => {
        const cocokNama = (item.name || "").toLowerCase().includes(keyword);
        const cocokKode = (item.code || "").toLowerCase().includes(keyword);

        if (!cocokNama && !cocokKode) return;

        const li = createItemElement(item);
        itemList.appendChild(li);
    });

    updateDashboard();
    updateTotal();
    renderCategoryCards();
}

function createItemElement(item) {
    const li = document.createElement("li");

    const title = document.createElement("strong");
    title.textContent = item.name;

    const code = document.createElement("small");
    code.textContent = `Kode: ${item.code}`;

    const buyPrice = document.createElement("small");
    buyPrice.textContent = `Modal : ${formatRupiah(item.buyPrice)}`;

    const sellPrice = document.createElement("small");
    sellPrice.textContent = `Jual : ${formatRupiah(item.sellPrice)}`;

    li.append(
        title, document.createElement("br"),
        code, document.createElement("br"),
        buyPrice, document.createElement("br"),
        sellPrice, document.createElement("br")
    );

    if (item.stock <= 5) {
        const badge = document.createElement("span");
        badge.className = "low-stock";
        badge.textContent = "⚠️ Stok Menipis";
        li.appendChild(badge);
    }

    // Stock Controls
    const controlsRow = document.createElement("div");
    controlsRow.className = "controls-row";

    const stockControls = document.createElement("div");
    stockControls.className = "stock-controls";

    const minusBtn = document.createElement("button");
    minusBtn.textContent = "➖";
    minusBtn.addEventListener("click", async () => {
        if (item.stock === 0) return;
        const newStock = item.stock - 1;
        const { error } = await supabaseClient.from("barang").update({ stok: newStock }).eq("id", item.id);
        if (error) return showToast("Gagal mengurangi stok!", "danger");
        await loadDataSupabase();
        refreshUI();
    });

    const stockText = document.createElement("strong");
    stockText.className = "stock-text";
    stockText.textContent = item.stock;

    const plusBtn = document.createElement("button");
    plusBtn.textContent = "➕";
    plusBtn.addEventListener("click", async () => {
        const newStock = item.stock + 1;
        const { error } = await supabaseClient.from("barang").update({ stok: newStock }).eq("id", item.id);
        if (error) return showToast("Gagal menambah stok!", "danger");
        await loadDataSupabase();
        refreshUI();
    });

    stockControls.append(minusBtn, stockText, plusBtn);

    // Action Buttons
    const actionButtons = document.createElement("div");
    actionButtons.className = "action-buttons";
    createActionButtons(actionButtons, item.id);

    controlsRow.append(stockControls, actionButtons);
    li.appendChild(controlsRow);

    return li;
}

function createActionButtons(container, id) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑";
    deleteBtn.addEventListener("click", async () => {
        if (confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
            const { error } = await supabaseClient.from("barang").delete().eq("id", id);
            if (error) return showToast("Gagal menghapus barang!", "danger");
            await loadDataSupabase();
            refreshUI();
            showToast("Barang berhasil dihapus!");
        }
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", () => {
        const index = items.findIndex(i => i.id === id);
        if (index === -1) return showToast("Barang tidak ditemukan!", "danger");

        itemNameInput.value = items[index].name;
        itemStockInput.value = items[index].stock;
        buyPriceInput.value = items[index].buyPrice;
        sellPriceInput.value = items[index].sellPrice;
        categorySelect.value = items[index].category;

        editingIndex = index;
        btnTambah.textContent = "💾 Simpan Perubahan";
    });

    const barcodeBtn = document.createElement("button");
    barcodeBtn.textContent = "🏷️";
    barcodeBtn.title = "Cetak Barcode";
    barcodeBtn.addEventListener("click", () => openBarcodeLabel(id));

    container.append(deleteBtn, editBtn, barcodeBtn);
}

function updateDashboard() {
    dashboardTotalBarang.textContent = items.length;
    dashboardTotalStok.textContent = items.reduce((sum, item) => sum + item.stock, 0);
    dashboardStokMenipis.textContent = items.filter(item => item.stock <= 5).length;
    dashboardBarangHabis.textContent = items.filter(item => item.stock === 0).length;
}

function updateTotal() {
    totalItems.textContent = `Total Barang : ${items.length}`;
}

function renderCategoryCards() {
    categoryContainer.replaceChildren();
    const categories = ["Semua", ...Object.keys(PREFIX_MAP)];

    categories.forEach((kategori) => {
        const count = kategori === "Semua" ? items.length : items.filter(i => i.category === kategori).length;
        const icon = CATEGORY_ICONS[kategori] || "📦";

        const card = document.createElement("div");
        card.className = `stat-card ${activeCategory === kategori ? "active" : ""}`;
        card.innerHTML = `
            <div class="card-header">
                <div class="icon">${icon}</div>
                <p>${kategori}</p>
            </div>
            <h2>${count}</h2>
        `;

        card.addEventListener("click", () => {
            activeCategory = kategori;
            renderItems();
        });

        categoryContainer.appendChild(card);
    });
}

// ===================================
// MODAL & SCANNER
// ===================================
function openScanner() {
    scannerModal.classList.add("show");
    html5QrCode = new Html5Qrcode("scannerReader");
    
    // Konfigurasi bingkai memanjang khusus Barcode Garis (1D)
    const config = { 
        fps: 10, 
        qrbox: { width: 260, height: 130 } 
    };

    html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
            scannedBarcodeInput.value = decodedText;
            showToast(`Barcode terdeteksi: ${decodedText}`);
            closeScanner();
        },
        () => {}
    ).catch((err) => {
        console.error(err);
        showToast("Kamera tidak bisa diakses!", "danger");
        closeScanner();
    });
}

function closeScanner() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
        html5QrCode = null;
    }
    scannerModal.classList.remove("show");
}

function openBarcodeLabel(id) {
    const item = getItemById(id);
    if (!item) return showToast("Barang tidak ditemukan!", "danger");

    barcodeItemName.textContent = item.name;
    barcodeItemPrice.textContent = formatRupiah(item.sellPrice);

    JsBarcode(barcodeSvg, item.code, {
        format: "CODE128",
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 14
    });

    barcodeModal.classList.add("show");
}

function exportCSV() {
    const csvData = items.map((item) => {
        let status = item.stock === 0 ? "Habis" : item.stock <= 5 ? "Menipis" : "Normal";
        return `"${item.name}",${item.stock},${status}`;
    });

    const csvContent = "Nama Barang,Stok,Status\n" + csvData.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "inventori_warungku.csv";
    link.click();
    URL.revokeObjectURL(link.href);
}

// ===================================
// EVENT LISTENERS & INITIALIZATION
// ===================================
function setupEventListeners() {
    btnTambah.addEventListener("click", addItem);
    searchInput.addEventListener("input", renderItems);

    sortSelect.addEventListener("change", () => {
        if (sortSelect.value === "nameAsc") items.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortSelect.value === "nameDesc") items.sort((a, b) => b.name.localeCompare(a.name));
        else if (sortSelect.value === "stockAsc") items.sort((a, b) => a.stock - b.stock);
        else if (sortSelect.value === "stockDesc") items.sort((a, b) => b.stock - a.stock);
        renderItems();
    });

    cardStokMenipis.addEventListener("click", () => {
        dashboardDetail.style.display = "block";
        dashboardDetailTitle.textContent = "⚠️ Barang Stok Menipis";
        dashboardDetailList.replaceChildren();
        items.filter(i => i.stock <= 5).forEach(i => {
            const li = document.createElement("li");
            li.textContent = `${i.name} - Stok: ${i.stock}`;
            dashboardDetailList.appendChild(li);
        });
    });

    cardBarangHabis.addEventListener("click", () => {
        dashboardDetail.style.display = "block";
        dashboardDetailTitle.textContent = "❌ Barang Habis";
        dashboardDetailList.replaceChildren();
        items.filter(i => i.stock === 0).forEach(i => {
            const li = document.createElement("li");
            li.textContent = `${i.name} - Stok: ${i.stock}`;
            dashboardDetailList.appendChild(li);
        });
    });

    exportButton.addEventListener("click", exportCSV);

    if (btnScanBarcode) btnScanBarcode.addEventListener("click", openScanner);
    if (btnCloseScanner) btnCloseScanner.addEventListener("click", closeScanner);
    if (btnCloseBarcode) btnCloseBarcode.addEventListener("click", () => barcodeModal.classList.remove("show"));
    if (btnPrintBarcode) btnPrintBarcode.addEventListener("click", () => window.print());

    itemStockInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addItem();
    });
}

async function init() {
    await loadDataSupabase();
    refreshUI();
    setupEventListeners();
}

init();

// Register Service Worker untuk PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then((reg) => console.log("PWA Service Worker terpasang:", reg.scope))
      .catch((err) => console.error("PWA Service Worker gagal:", err));
  });
}