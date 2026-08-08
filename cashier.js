// ===================================
// DATA
// ===================================

let items = [];
let cart = [];

// ===================================
// STORAGE
// ===================================

function loadData() {

    const data = localStorage.getItem("warungkuItems");

    if (data) {
        items = JSON.parse(data);
    }

    console.log(items);

}

// ===================================
// RENDER
// ===================================

function renderCashierItems() {

    cashierItems.replaceChildren();

    items.forEach((item) => {

        const card = createCashierCard(item);

        cashierItems.appendChild(card);

    });

}

function createCashierCard(item) {

    const card = document.createElement("div");
    card.className = "cashier-card";

    const title = document.createElement("h3");
    title.textContent = item.name;

    const price = document.createElement("p");
    price.textContent =
        `Rp ${item.sellPrice.toLocaleString("id-ID")}`;

    const stock = document.createElement("small");
    stock.textContent =
        `Stok : ${item.stock}`;

    const button = document.createElement("button");
    button.textContent = "Tambah";

    card.append(
        title,
        price,
        stock,
        button
    );

    return card;

}

function formatRupiah(angka){

    return "Rp " +
        angka.toLocaleString("id-ID");

}

// ===================================
// DOM ELEMENTS
// ===================================

const cashierItems =
    document.getElementById("cashierItems");

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");

// ===================================
// INIT
// ===================================

function init() {

    loadData();

    renderCashierItems();

}

init();