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
    price.textContent = formatRupiah(item.sellPrice);

    const stock = document.createElement("small");
    stock.textContent =
        `Stok : ${item.stock}`;

    const addButton = document.createElement("button");

        addButton.textContent = "➕ Tambah";

        addButton.addEventListener("click", () => {

            addToCart(item.id);

        });

    card.append(
        title,
        price,
        stock,
        addButton
    );

    return card;

}

function addToCart(itemId) {

    const existingItem = cart.find(item => item.id === itemId);

    const inventoryItem = getItemById(itemId);

    if (!inventoryItem) {
        return;
    }

    if (existingItem) {

        if (existingItem.qty >= inventoryItem.stock) {

            alert("Stok tidak mencukupi!");
            return;

        }

        existingItem.qty++;

    } else {

        if (inventoryItem.stock === 0) {

            alert("Barang habis!");
            return;

        }

        cart.push({
            id: inventoryItem.id,
            name: inventoryItem.name,
            price: inventoryItem.sellPrice,
            qty: 1
        });

    }

    renderCart();

}

function getItemById(id) {

    return items.find(item => item.id === id);

}

function renderCart() {

    cartItems.replaceChildren();

    let total = 0;

    cart.forEach(item => {

        const card = createCartItem(item);

        cartItems.appendChild(card);

        total += item.price * item.qty;

    });

    updateCartTotal();



}

function updateCartTotal() {

    let total = 0;

    cart.forEach((item) => {

        total += item.price * item.qty;

    });

    cartTotal.textContent = formatRupiah(total);

}

function createCartItem(item) {

    const li = document.createElement("li");

    const title = document.createElement("strong");
    title.textContent = item.name;

    const subtotal = document.createElement("p");
    subtotal.textContent =
        formatRupiah(item.price * item.qty);

    const controls = document.createElement("div");
    controls.className = "stock-controls";

    const minusBtn = document.createElement("button");
    minusBtn.textContent = "➖";

    const qty = document.createElement("strong");
    qty.className = "stock-text";
    qty.textContent = item.qty;

    const plusBtn = document.createElement("button");
    plusBtn.textContent = "➕";

    controls.append(
        minusBtn,
        qty,
        plusBtn
    );

    li.append(
        title,
        subtotal,
        controls
    );

    return li;

}

function checkout() {

    if (cart.length === 0) {

        alert("Keranjang masih kosong!");

        return;

    }

    cart.forEach((cartItem) => {

        const item = getItemById(cartItem.id);

        if (item) {

            item.stock -= cartItem.qty;

        }

    });

    localStorage.setItem(
        "warungkuItems",
        JSON.stringify(items)
    );

    cart = [];

    renderCashierItems();

    renderCart();

    alert("Transaksi berhasil!");

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

const checkoutButton =
    document.getElementById("checkoutButton");

/* ==================================================
   EVENTS
================================================== */

function setupEventListeners() {

    checkoutButton.addEventListener("click", checkout);

}

    // ===================================
// INIT
// ===================================

function init() {

    loadData();

    renderCashierItems();

    renderCart();

    setupEventListeners();

}

init();