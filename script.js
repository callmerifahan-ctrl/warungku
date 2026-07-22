let items = [];
let editingIndex = -1;

function saveData() {
    localStorage.setItem("warungkuItems", JSON.stringify(items));
}

function loadData() {
    const data = localStorage.getItem("warungkuItems");

    if (data) {
        items = JSON.parse(data);
    }
}

function renderItems() {

    const keyword = document.getElementById("searchInput")
        .value
        .toLowerCase();

    const itemList = document.getElementById("itemList");

    itemList.innerHTML = "";

    items.forEach((item, index) => {

        if (!item.name.toLowerCase().includes(keyword)) {
            return;
        }

        const li = createItem(item);

        createButtons(li, item.id);

        itemList.appendChild(li);

    });

    updateDashboard();
    updateTotal();

}

// ← renderItems selesai di sini

function createItem(item) {

    const li = document.createElement("li");

    if (item.stock <= 5) {

        li.innerHTML = `
            ${item.name} - ${item.stock}
            <span class="low-stock">
                ⚠️ Stok Menipis
            </span>
        `;

    } else {

        li.textContent = `${item.name} - ${item.stock}`;

    }

    return li;

}


function addItem() {

    const itemName = document.getElementById("itemName").value.trim();
    const itemStock = parseInt(document.getElementById("itemStock").value);

    if (itemName === "") {
        alert("Nama barang wajib diisi!");
        return;
    }

    if (isNaN(itemStock)) {
        alert("Stok barang wajib diisi!");
        return;
    }

    if (editingIndex === -1) {

        const item = {
            id: Date.now(),
            name: itemName,
            stock: itemStock
        };

        items.push(item);

    } else {

        items[editingIndex] = {
            id: items[editingIndex].id, // ID jangan berubah
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

    totalItems.textContent =
`     Total Barang : ${items.length}`;

}

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

    const deleteButton = document.createElement("button");

    deleteButton.textContent = "🗑";

    deleteButton.addEventListener("click", () => {

        if (confirm("Apakah kamu yakin ingin menghapus barang ini?")) {

            const index = items.findIndex(item => item.id === id);

            if (index === -1) {
                alert("Barang tidak ditemukan!");
                return;
            }

            items.splice(index, 1);

            saveData();

            renderItems();

        }

    });

    const editButton = document.createElement("button");
        editButton.textContent = "✏️";

        editButton.addEventListener("click", () => {

            const index = items.findIndex(item => item.id === id);

            if (index === -1) {
                alert("Barang tidak ditemukan!");
                return;
            }

            document.getElementById("itemName").value =
                items[index].name;

            document.getElementById("itemStock").value =
                items[index].stock;

            editingIndex = index;

            document.getElementById("btnTambah").textContent =
                "💾 Simpan Perubahan";

        });

    li.appendChild(deleteButton);
    li.appendChild(editButton);

}

function bukaStokMenipis() {

    const daftarBarang = items.filter((item) => {

       return item.stock <= 5;

    });

    console.log(daftarBarang);

    tampilkanDetailDashboard(
        "⚠️ Barang Stok Menipis",

        daftarBarang
        
    );

}

function bukaBarangHabis() {

    const daftarBarang = items.filter((stok) => {

       return stok.stock === 0;

    });

    console.log(daftarBarang);

    tampilkanDetailDashboard(
        "❌ Barang Habis",

        daftarBarang
        
    );

}

function tampilkanDetailDashboard(
    judul,
    daftarBarang
) {

     const detail =
    document.getElementById("dashboardDetail");

    const title =
    document.getElementById("dashboardDetailTitle");

    const list =
    document.getElementById("dashboardDetailList");

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

loadData();
renderItems();

document.getElementById("searchInput")
.addEventListener("input", () => {

    renderItems();

});

// =========================
// Event Dashboard
// =========================

const cardStokMenipis = document.getElementById("cardStokMenipis");
const cardBarangHabis = document.getElementById("cardBarangHabis");
const exportButton = document.getElementById("exportButton");
const btnTambah = document.getElementById("btnTambah");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");

cardStokMenipis.addEventListener("click", bukaStokMenipis);
cardBarangHabis.addEventListener("click", bukaBarangHabis);
exportButton.addEventListener("click", exportCSV);
btnTambah.addEventListener("click", addItem);
searchInput.addEventListener("input", renderItems);

sortSelect.addEventListener("change", () => {

    if (sortSelect.value === "nameAsc") {

        items.sort((a,b) => {
            return a.name.localeCompare(b.name);
        });

    }

    else if (sortSelect.value === "nameDesc") {

        items.sort((a,b) => {
            return b.name.localeCompare(a.name);
        });

    }

    else if (sortSelect.value === "stockAsc") {

        items.sort((a,b) => {
            return a.stock - b.stock;
        });

    }

    else if (sortSelect.value === "stockDesc") {

        items.sort((a,b) => {
            return b.stock - a.stock;
        });

    }

    renderItems();

});