let editingItem = null;

function addItem(){

    const itemName =
        document.getElementById("itemName").value;

    const itemStock =
        document.getElementById("itemStock").value;

    const itemList =
        document.getElementById("itemList");

        if (itemName === "") {

        alert("Nama barang wajib diisi!");

        return;

        }

        if (itemStock === "") {

        alert("Stok barang wajib diisi!");

        return;

    }

        if (editingItem !== null) {

        editingItem.textContent = `${itemName} - ${itemStock}`;

        createButtons(editingItem);
        
        document.getElementById("addButton").textContent =
            "Tambah Barang";

            editingItem = null;

            clearInput();

        return;

        }

    const li = document.createElement("li");

    li.textContent = `${itemName} - ${itemStock}`;

    createButtons(li);
    
    itemList.appendChild(li);

    updateTotal();

    clearInput();

}

function clearInput() {

    document.getElementById("itemName").value = "";
    document.getElementById("itemStock").value = "";

    document.getElementById("itemName").focus();
   
    document.getElementById("itemName").select();

}

function createButtons(li) {

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑";

    deleteButton.addEventListener("click", () => {

        li.remove();

        updateTotal();

    });

    const editButton = document.createElement("button");
    editButton.textContent = "✏️";

    editButton.addEventListener("click", () => {

        const text = li.textContent;

        const data = text.split("-");

        document.getElementById("itemName").value = data[0];

        document.getElementById("itemStock").value =
            parseInt(data[1]);

        editingItem = li;
        document.getElementById("addButton").textContent =
            "💾 Simpan Perubahan";

    });

    li.appendChild(deleteButton);

    li.appendChild(editButton);

}

function updateTotal(){

    const itemList = document.getElementById("itemList");

    const totalItems = document.getElementById("totalItems");

    totalItems.textContent =
        `Total Barang : ${itemList.children.length}`;

}

document.getElementById("itemStock").addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        addItem();

    }

});