// ===================================
// DATA
// ===================================

let items = [];
let cart = [];
let transactions = [];

// ===================================
// DOM ELEMENTS
// ===================================

const cashierItems =
    document.getElementById("cashierItems");

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");

const paymentInput =
    document.getElementById("paymentInput");

const changeTotal =
    document.getElementById("changeTotal");

const checkoutButton =
    document.getElementById("checkoutButton");

// ===================================
// STORAGE
// ===================================

function loadData() {

    const data =
        localStorage.getItem("warungkuItems");

    if (data) {
        items = JSON.parse(data);
    }

    const history =
        localStorage.getItem("warungkuTransactions");

    if (history) {
        transactions = JSON.parse(history);
    }

}

function saveItems() {

    localStorage.setItem(
        "warungkuItems",
        JSON.stringify(items)
    );

}

function saveTransactions() {

    localStorage.setItem(
        "warungkuTransactions",
        JSON.stringify(transactions)
    );

}

function generateTransactionCode() {

    const number =
        transactions.length + 1;

    return "TRX-" +
        String(number).padStart(6, "0");

}

// ===================================
// EVENT LISTENERS
// ===================================

function setupEventListeners() {

    checkoutButton.addEventListener(
        "click",
        checkout
    );

    if (paymentInput) {

        paymentInput.addEventListener(
            "input",
            updatePayment
        );

    }

}

// ===================================
// CART
// ===================================

function addToCart(itemId) {

    const inventoryItem =
        getItemById(itemId);

    if (!inventoryItem) {
        return;
    }

    const existingItem =
        cart.find(item => item.id === itemId);

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

function increaseCartQty(itemId) {

    const cartItem =
        cart.find(item => item.id === itemId);

    const inventoryItem =
        getItemById(itemId);

    if (!cartItem || !inventoryItem) {
        return;
    }

    if (cartItem.qty >= inventoryItem.stock) {

        alert("Stok tidak mencukupi!");

        return;

    }

    cartItem.qty++;

    renderCart();

}

function decreaseCartQty(itemId) {

    const index =
        cart.findIndex(item => item.id === itemId);

    if (index === -1) {
        return;
    }

    cart[index].qty--;

    if (cart[index].qty <= 0) {

        cart.splice(index, 1);

    }

    renderCart();

}

function clearCart() {

    cart = [];

    renderCart();

}

function getItemById(id) {

    return items.find(item => item.id === id);

}

function getCartTotal() {

    let total = 0;

    cart.forEach((item) => {

        total += item.price * item.qty;

    });

    return total;

}

function renderCart() {

    cartItems.replaceChildren();

    cart.forEach((item) => {

        const card =
            createCartItem(item);

        cartItems.appendChild(card);

    });

    updateCartTotal();

}

function updateCartTotal() {

    const total =
        getCartTotal();

    cartTotal.textContent =
        formatRupiah(total);

}

// ===================================
// CHECKOUT
// ===================================

function updatePayment() {

    const payment =
        parseInt(paymentInput.value) || 0;

    const total =
        getCartTotal();

    const change =
        payment - total;

    if (change < 0) {

        changeTotal.textContent =
            "Uang Kurang";

        return;

    }

    changeTotal.textContent =
        formatRupiah(change);

}

function checkout() {

    if (cart.length === 0) {

        alert("Keranjang masih kosong!");

        return;

    }

    const total =
        getCartTotal();

    const payment =
        parseInt(paymentInput.value);

    if (isNaN(payment)) {

        alert("Masukkan jumlah pembayaran!");

        return;

    }

    if (payment < total) {

        alert("Uang pembayaran kurang!");

        return;

    }

    const change =
        payment - total;

    cart.forEach((cartItem) => {

        const item =
            getItemById(cartItem.id);

        if (item) {

            item.stock -= cartItem.qty;

        }

    });

    saveItems();

    const transaction = {

        id: Date.now(),

        transactionCode:
            generateTransactionCode(),

        date:
            new Date().toLocaleString("id-ID"),

        items: [...cart],

        total,

        payment,

        change

    };

    transactions.push(transaction);

    saveTransactions();

    paymentInput.value = "";

    changeTotal.textContent =
        formatRupiah(0);

    clearCart();

    renderCashierItems();

    alert("Transaksi berhasil!");

}

// ===================================
// RENDER
// ===================================

function renderCashierItems() {

    cashierItems.replaceChildren();

    items.forEach((item) => {

        const card =
            createCashierCard(item);

        cashierItems.appendChild(card);

    });

}

// ===================================
// CREATE ELEMENTS
// ===================================

function createCashierCard(item) {

    const card =
        document.createElement("div");

    card.className =
        "cashier-card";

    const title =
        document.createElement("h3");

    title.textContent =
        item.name;

    const price =
        document.createElement("p");

    price.textContent =
        formatRupiah(item.sellPrice);

    const stock =
        document.createElement("small");

    stock.textContent =
        `Stok : ${item.stock}`;

    const addButton =
        document.createElement("button");

    addButton.textContent =
        "➕ Tambah";

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

function createCartItem(item) {

    const li =
        document.createElement("li");

    const title =
        document.createElement("strong");

    title.textContent =
        item.name;

    const subtotal =
        document.createElement("p");

    subtotal.textContent =
        formatRupiah(item.price * item.qty);

    const controls =
        document.createElement("div");

    controls.className =
        "stock-controls";

    const minusBtn =
        document.createElement("button");

    minusBtn.textContent =
        "➖";

    minusBtn.addEventListener("click", () => {

        decreaseCartQty(item.id);

    });

    const qty =
        document.createElement("strong");

    qty.className =
        "stock-text";

    qty.textContent =
        item.qty;

    const plusBtn =
        document.createElement("button");

    plusBtn.textContent =
        "➕";

    plusBtn.addEventListener("click", () => {

        increaseCartQty(item.id);

    });

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

// ===================================
// UTILITIES
// ===================================

function formatRupiah(angka) {

    return "Rp " +
        angka.toLocaleString("id-ID");

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