let items = [];
let editingIndex = -1;
let totalStok = 0;

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

    const keyword =
    document.getElementById("searchInput")
        .value
        .toLowerCase();
    
    const itemList = document.getElementById("itemList");

    itemList.innerHTML = "";

    items.forEach((item, index) => {

        if (!item.name.toLowerCase().includes(keyword)) {

            return;

        }

        const li = document.createElement("li");

        if (item.stock <= 5) {

            li.innerHTML = `
                ${item.name} - ${item.stock}
                <span class="low-stock">
                    ⚠️ Stok Menipis
                </span>
            `;

        } else {

            li.textContent =
                `${item.name} - ${item.stock}`;

        }

        createButtons(li, index);

        itemList.appendChild(li);

    });

    updateDashboard();
    updateTotal();

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

        items.push({
            name: itemName,
            stock: itemStock
        });

    } else {

        items[editingIndex] = {
            name: itemName,
            stock: itemStock
        };

        editingIndex = -1;

        document.getElementById("addButton").textContent =
            "Tambah Barang";
    }

    saveData();
    renderItems();
    clearInput();
}

function updateTotal() {

    const itemList = document.getElementById("itemList");

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

function clearInput() {

    document.getElementById("itemName").value = "";
    document.getElementById("itemStock").value = "";

    document.getElementById("itemName").focus();

}

function createButtons(li, index) {

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑";

    deleteButton.addEventListener("click", () => {

        items.splice(index, 1);

        saveData();

        renderItems();

    });

    const editButton = document.createElement("button");
    editButton.textContent = "✏️";

    editButton.addEventListener("click", () => {

        document.getElementById("itemName").value =
            items[index].name;

        document.getElementById("itemStock").value =
            items[index].stock;

        editingIndex = index;

        document.getElementById("addButton").textContent =
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

    tampilkanDetailDashboard("❌ Barang Habis");

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

cardStokMenipis.addEventListener("click", bukaStokMenipis);
cardBarangHabis.addEventListener("click", bukaBarangHabis);