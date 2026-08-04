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
    Minuman: "🥤",
    Makanan: "🍜",
    Snack: "🍪",
    Bumbu: "🧂",
    Kebersihan: "🧼",
    Perawatan: "🧴",
    ATK: "✏️"
};

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

    const prefix = PREFIX_MAP[category];

    const counters = {};

    Object.keys(PREFIX_MAP).forEach((key) => {
        counters[key] = 0;
    });

    let changed = false;

    items.forEach(item => {

        counters[item.category]++;

        if (!item.code) {
            
            item.code =
                PREFIX_MAP[item.category] +
                String(counters[item.category]).padStart(4, "0");

            changed = true;
        }

    });

    if (changed) {
        saveData();
    }

}

function renderItems() {

    const keyword = document.getElementById("searchInput")
        .value
        .toLowerCase();

    const itemList = document.getElementById("itemList");

    itemList.innerHTML = "";

    let filteredItems = items;

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

    const li = document.createElement("li");

    if (item.stock <= 5) {

        li.innerHTML = `
            <strong>${item.name}</strong><br>
            <small>Kode: ${item.code}</small><br>
            Stok: ${item.stock}
            <span class="low-stock">
                ⚠️ Stok Menipis
            </span>
        `;

    } else {

        li.innerHTML = `
            <strong>${item.name}</strong><br>
            <small>Kode: ${item.code}</small><br>
            Stok: ${item.stock}
        `;

    }

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

// ===================================
// CRUD
// ===================================

function addItem() {

    const itemName = document.getElementById("itemName").value.trim();
    const itemStock = parseInt(document.getElementById("itemStock").value);
    const itemCategory = document.getElementById("category").value;

    if (itemName === "") {
        alert("Nama barang wajib diisi!");
        return;
    }

    if (isNaN(itemStock)) {
        alert("Stok barang wajib diisi!");
        return;
    }

    if (editingIndex === -1) {

        const newItem = {
            id: Date.now(),
            code: generateItemCode(itemCategory),
            category: itemCategory,
            name: itemName,
            stock: itemStock
        };

        items.push(newItem);

    } else {

        items[editingIndex] = {
            id: items[editingIndex].id,
            code: generateItemCode(itemCategory),
            category: itemCategory,
            name: itemName,
            stock: itemStock
        };

        editingIndex = -1;

        document.getElementById("btnTambah").textContent =
            "Tambah Barang";
    }

    saveData();
    renderItems();
    clearInput();
}

function updateTotal() {

    const totalItems = document.getElementById("totalItems");

    totalItems.textContent = `Total Barang : ${items.length}`;

}

// ===================================
// DASHBOARD
// ===================================

function updateDashboard() {

    // Total Barang
    const totalBarang =
        document.getElementById("dashboardTotalBarang");

    totalBarang.textContent = items.length;

    // Total Stok
    const totalStok =
        document.getElementById("dashboardTotalStok");

    let jumlahStok = 0;

    items.forEach((item) => {
        jumlahStok += item.stock;
    });

    totalStok.textContent = jumlahStok;

    // Stok Menipis
    const stokMenipisElement =
        document.getElementById("dashboardStokMenipis");

    let jumlahStokMenipis = 0;

    items.forEach((item) => {
        if (item.stock <= 5) {
            jumlahStokMenipis++;
        }
    });

    stokMenipisElement.textContent = jumlahStokMenipis;

    // Barang Habis
    const barangHabisElement =
        document.getElementById("dashboardBarangHabis");

    let jumlahBarangHabis = 0;

    items.forEach((item) => {
        if (item.stock === 0) {
            jumlahBarangHabis++;
        }
    });

    barangHabisElement.textContent = jumlahBarangHabis;
}

function renderCategoryCards() {

    const categoryContainer =
        document.getElementById("categoryContainer");

    categoryContainer.innerHTML = "";

    Object.keys(PREFIX_MAP).forEach((kategori) => {

        const jumlah = getJumlahKategori(kategori);
        const icon = CATEGORY_ICONS[kategori];

       categoryContainer.innerHTML += `

            <div class="stat-card">

                <div class="card-header">

                    <div class="icon">${icon}</div>

                    <p>${kategori}</p>

                </div>

                <h2>${jumlah}</h2>

            </div>
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

function clearInput() {

    document.getElementById("itemName").value = "";
    document.getElementById("itemStock").value = "";

    document.getElementById("itemName").focus();

}

function createButtons(li, id) {

    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "🗑";

    deleteBtn.addEventListener("click", () => {

        if (confirm("Apakah kamu yakin ingin menghapus barang ini?")) {

            const index = items.findIndex(i => i.id === id);

            if (index === -1) {
                alert("Barang tidak ditemukan!");
                return;
            }

            items.splice(index, 1);

            saveData();

            renderItems();

        }

    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";

    editBtn.addEventListener("click", () => {

        const index = items.findIndex(i => i.id === id);

        if (index === -1) {
            alert("Barang tidak ditemukan!");
            return;
        }

        document.getElementById("itemName").value =
            items[index].name;

        document.getElementById("itemStock").value =
            items[index].stock;

        // dulu kategori gak ikut ke-restore pas edit
        document.getElementById("category").value =
            items[index].category;

        editingIndex = index;

        document.getElementById("btnTambah").textContent =
            "💾 Simpan Perubahan";

    });

    li.appendChild(deleteBtn);
    li.appendChild(editBtn);

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

    const detail = document.getElementById("dashboardDetail");
    const title = document.getElementById("dashboardDetailTitle");
    const list = document.getElementById("dashboardDetailList");

    detail.style.display = "block";
    title.textContent = judul;
    list.innerHTML = "";

    daftarBarang.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - ${item.stock}`;
        list.appendChild(li);
    });

}

document.getElementById("itemStock").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addItem();
    }
});

function getJumlahKategori(kategori) {

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

loadData();
renderItems();

// =========================
// Event Dashboard
// =========================

const cardStokMenipis = document.getElementById("cardStokMenipis");
const cardBarangHabis = document.getElementById("cardBarangHabis");
const exportButton = document.getElementById("exportButton");
const btnTambah = document.getElementById("btnTambah");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");

// ===================================
// EVENTS
// ===================================

cardStokMenipis.addEventListener("click", bukaStokMenipis);
cardBarangHabis.addEventListener("click", bukaBarangHabis);
exportButton.addEventListener("click", exportCSV);
btnTambah.addEventListener("click", addItem);

// (dulu ini didaftarkan 2x, sekarang cukup sekali)
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