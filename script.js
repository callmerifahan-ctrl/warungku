// ===================================
// DATA 
// ===================================

let items = [];
let editingIndex = -1;
let activeCategory = "Semua";

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
    Semua:"📦",
    Minuman: "🥤",
    Makanan: "🍜",
    Snack: "🍪",
    Bumbu: "🧂",
    Kebersihan: "🧼",
    Perawatan: "🧴",
    ATK: "✏️"
};

/* ==================================================
   DOM ELEMENTS
================================================== */

const itemNameInput = document.getElementById("itemName");
const itemStockInput = document.getElementById("itemStock");
const categorySelect = document.getElementById("category");

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

const buyPriceInput = document.getElementById("buyPrice");
const sellPriceInput = document.getElementById("sellPrice");

// ===================================
// STORAGE
// ===================================

function saveData() {
    localStorage.setItem("warungkuItems", JSON.stringify(items));
}

function loadData() {
    const data = localStorage.getItem("warungkuItems");

    if (data) {
        items = JSON.parse(data);

        migrateItems();
    }
}

function migrateItems() {

    const counters = {};

    Object.keys(PREFIX_MAP).forEach((key) => {
        counters[key] = 0;
    });

    let changed = false;

    items.forEach(item => {

        if (item.buyPrice === undefined) {
            item.buyPrice = 0;
            changed = true;
        }

        if (item.sellPrice === undefined) {
            item.sellPrice = 0;
            changed = true;
        }

    });

    if (changed) {
        saveData();
    }

}

function renderItems() {

    const keyword =
    searchInput.value.toLowerCase();

    itemList.replaceChildren();

    

    let filteredItems = items;

    if (activeCategory !== "Semua") {

        filteredItems = items.filter((item) => {
            
            return item.category === activeCategory;
        
        });

    }

    filteredItems.forEach((item) => {

        const cocokNama =
            item.name.toLowerCase().includes(keyword);

        const cocokKode =
            item.code &&
            item.code.toLowerCase().includes(keyword);

        if (!cocokNama && !cocokKode) {
            return;
        }

        const li = createItem(item);

        itemList.appendChild(li);

    });

    updateDashboard();
    updateTotal();
    renderCategoryCards();
}

function createItem(item) {

    const itemHeader = document.createElement("div");
    itemHeader.className = "item-header";

    const itemName = document.createElement("strong");
    itemName.textContent = item.name;

    itemHeader.appendChild(itemName);

    const li = document.createElement("li");

    const title = document.createElement("strong");
    title.textContent = item.name;

    const br1 = document.createElement("br");

    const code = document.createElement("small");
    code.textContent = `Kode: ${item.code}`;

    const br3 = document.createElement("br");

    const buyPrice = document.createElement("small");
    buyPrice.textContent =
        `Modal : ${formatRupiah(item.buyPrice)}`;

    const br4 = document.createElement("br");

    const sellPrice = document.createElement("small");
    sellPrice.textContent =
        `Jual : ${formatRupiah(item.sellPrice)}`;

    const br2 = document.createElement("br");

    li.append(title, br1, code, br2,buyPrice,br3,sellPrice,br4);

    createButtons(li, item.id);

    return li;

}

// ===================================
// SKU
// ===================================

function generateItemCode(category) {

    const prefix = PREFIX_MAP[category];

    // Ambil semua kode pada kategori yang sama
    const categoryCodes = items
        .filter(item => item.category === category)
        .map(item => {
            const number = item.code?.replace(prefix, "");
            return parseInt(number) || 0;
        });

    // Cari nomor terbesar
    const lastNumber = categoryCodes.length > 0
        ? Math.max(...categoryCodes)
        : 0;

    // Tambah 1
    const newNumber = lastNumber + 1;

    return prefix + String(newNumber).padStart(4, "0");
}

/* ==================================================
   HELPERS
================================================== */

function refreshUI() {

    renderItems();

}

function resetForm() {

    itemNameInput.value = "";
    itemStockInput.value = "";

    buyPriceInput.value = "";
    sellPriceInput.value = "";

    categorySelect.value = "Minuman";

    itemNameInput.focus();

}

function formatRupiah(angka) {

    return "Rp " + angka.toLocaleString("id-ID");

}

function showToast(message, type = "success") {

    toast.textContent = message;

    toast.className = "toast";

    if(type === "success"){
        toast.style.background = "var(--success)";
    }

    if(type === "warning"){
        toast.style.background = "var(--warning)";
    }

    if(type === "danger"){
        toast.style.background = "var(--danger)";
    }

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    },2500);

}

function getItemById(id){

    return items.find(item => item.id === id);

}

// ===================================
// CRUD
// ===================================

function addItem() {

    const itemName =
    itemNameInput.value.trim();

    const itemStock =
        parseInt(itemStockInput.value);

    const itemBuyPrice =
        parseInt(buyPriceInput.value);

    const itemSellPrice =
        parseInt(sellPriceInput.value);

    const itemCategory =
        categorySelect.value;

    if (itemName === "") {
        showToast("Nama barang wajib diisi!");
        return;
    }

    if (isNaN(itemStock)) {
        showToast("Stok barang wajib diisi!");
        return;
    }

    if (isNaN(itemBuyPrice)) {

        showToast("Harga beli wajib diisi!");

        return;

    }

    if (isNaN(itemSellPrice)) {

        showToast("Harga jual wajib diisi!");

        return;

    }

    if (editingIndex === -1) {

        const newItem = {
            id: Date.now(),
            code: generateItemCode(itemCategory),
            category: itemCategory,
            name: itemName,

            stock: itemStock,

            buyPrice: itemBuyPrice,
            sellPrice: itemSellPrice
        };

        items.push(newItem);

    } else {

        items[editingIndex] = {
            id: items[editingIndex].id,
            code: items[editingIndex].code,
            category: itemCategory,
            name: itemName,
            stock: itemStock,
            buyPrice: itemBuyPrice,
            sellPrice: itemSellPrice
        };

        editingIndex = -1;

        btnTambah.textContent =
            "Tambah Barang";
    }

    saveData();
    refreshUI();
    resetForm();
    showToast("Barang Berhasil disimpan!");
}

function updateTotal() {

    totalItems.textContent =
    `Total Barang : ${items.length}`;

}

// ===================================
// DASHBOARD
// ===================================

function updateDashboard() {

    // Total Barang
    dashboardTotalBarang.textContent =
        items.length;

    // Total Stok
    dashboardTotalStok

    let jumlahStok = 0;

    items.forEach((item) => {
        jumlahStok += item.stock;
    });

    dashboardTotalStok.textContent = jumlahStok;

    // Stok Menipis
    dashboardStokMenipis

    let jumlahStokMenipis = 0;

    items.forEach((item) => {
        if (item.stock <= 5) {
            jumlahStokMenipis++;
        }
    });

    dashboardStokMenipis.textContent = jumlahStokMenipis;

    // Barang Habis
    dashboardBarangHabis

    let jumlahBarangHabis = 0;

    items.forEach((item) => {
        if (item.stock === 0) {
            jumlahBarangHabis++;
        }
    });

    dashboardBarangHabis.textContent = jumlahBarangHabis;
}

function renderCategoryCards() {

    const categoryContainer = 
        document.getElementById("categoryContainer");

    categoryContainer.innerHTML = "";

    Object.keys(PREFIX_MAP).forEach((kategori) => {

        const jumlah = getJumlahKategori(kategori);
        const icon = CATEGORY_ICONS[kategori];

        const card = document.createElement("div");

        card.className = "stat-card";

        card.innerHTML = `
            <div class="card-header">
                <div class="icon">${icon}</div>
                <p>${kategori}</p>
            </div>

            <h2>${jumlah}</h2>
        `;

    });

}

// ===================================
// EXPORT
// ===================================

function exportCSV() {

    const csvData = items.map((item) => {

        let status = "";

        if (item.stock === 0) {
            status = "Habis";
        } else if (item.stock <= 5) {
            status = "Menipis";
        } else {
            status = "Normal";
        }

        return `${item.name},${item.stock},${status}`;

    });

    const header = "Nama Barang,Stok,Status";
    const csvContent = header + "\n" + csvData.join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "inventori.csv";

    link.click();

    URL.revokeObjectURL(url);

}

function createButtons(actionButtons, id) {

    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "🗑";

    deleteBtn.addEventListener("click", () => {

        if (confirm("Apakah kamu yakin ingin menghapus barang ini?")) {

            const index = items.findIndex(i => i.id === id);

            if (index === -1) {
                showToast("Barang tidak ditemukan!");
                return;
            }

            items.splice(index, 1);

            saveData();

            refreshUI();

            showToast("Barang Berhasil dihapus!");

        }

    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";

    editBtn.addEventListener("click", () => {

        const index = items.findIndex(i => i.id === id);

        if (index === -1) {
            showToast("Barang tidak ditemukan!");
            return;
        }

        itemNameInput.value =
            items[index].name;

        itemStockInput.value =
            items[index].stock;

        buyPriceInput.value =
        items[index].buyPrice;

        sellPriceInput.value =
            items[index].sellPrice;

        // dulu kategori gak ikut ke-restore pas edit
        categorySelect.value =
            items[index].category;

        editingIndex = index;

        btnTambah.textContent =
            "💾 Simpan Perubahan";

    });

    actionButtons.appendChild(deleteBtn);
    actionButtons.appendChild(editBtn);

}

function bukaStokMenipis() {

    const daftarBarang = items.filter((item) => {
       return item.stock <= 5;
    });

    tampilkanDetailDashboard(
        "⚠️ Barang Stok Menipis",
        daftarBarang
    );

}

function bukaBarangHabis() {

    const daftarBarang = items.filter((item) => {
       return item.stock === 0;
    });

    tampilkanDetailDashboard(
        "❌ Barang Habis",
        daftarBarang
    );

}

function tampilkanDetailDashboard(judul, daftarBarang) {

    dashboardDetail.style.display = "block";

    dashboardDetailTitle.textContent = judul;

    dashboardDetailList.replaceChildren();

    daftarBarang.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - ${item.stock}`;
        dashboardDetailList.appendChild(li);
    });

}

itemStockInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addItem();
    }
});

function getJumlahKategori(kategori) {

    if (kategori === "Semua") {
      return items.length;
    }
    
    const data = items.filter((item) => {
        return item.category === kategori;
    });

    return data.length;

}

function hitungKategori(kategori, elementId) {
    const data = items.filter((item) => {
        return item.category === kategori;
    });

    document.getElementById(elementId).textContent = data.length;
}

/* ==================================================
   EVENTS
================================================== */

function setupEventListeners() {

    btnTambah.addEventListener("click", addItem);

    searchInput.addEventListener("input", renderItems);

    sortSelect.addEventListener("change", () => {

        if (sortSelect.value === "nameAsc") {
            items.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortSelect.value === "nameDesc") {
            items.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortSelect.value === "stockAsc") {
            items.sort((a, b) => a.stock - b.stock);
        } else if (sortSelect.value === "stockDesc") {
            items.sort((a, b) => b.stock - a.stock);
        }

        renderItems();

    });

    cardStokMenipis.addEventListener("click", bukaStokMenipis);
    
    cardBarangHabis.addEventListener("click", bukaBarangHabis);
    
    exportButton.addEventListener("click", exportCSV);
    
    // dst...

}

/* ==================================================
   INIT
================================================== */

function init() {

    loadData();

    refreshUI();

    setupEventListeners();

}

/* ==================================================
   START APP
================================================== */

init();