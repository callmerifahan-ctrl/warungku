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

    const itemList = document.getElementById("itemList");

    itemList.innerHTML = "";

    items.forEach((item, index) => {

        const li = document.createElement("li");

        li.textContent = `${item.name} - ${item.stock}`;

        createButtons(li, index);

        itemList.appendChild(li);

    });

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
        `Total Barang : ${itemList.children.length}`;

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

document.getElementById("itemStock").addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        addItem();

    }

});

loadData();
renderItems();