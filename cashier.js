// ===================================
// CONFIG & SUPABASE SETUP
// ===================================
const SUPABASE_URL = "https://dyyzsuleugpgiqutebwv.supabase.co";
const SUPABASE_KEY = "sb_publishable_hKWVFsDZC539-T3nVyS13g_ME3HC0AP";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

// ===================================
// DATA STATE
// ===================================
let items = [];
let cart = [];
let html5QrCode = null;

// ===================================
// DOM ELEMENTS
// ===================================
const cashierItems = document.getElementById("cashierItems");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const paymentInput = document.getElementById("paymentInput");
const changeTotal = document.getElementById("changeTotal");
const checkoutButton = document.getElementById("checkoutButton");

const btnScanCashier = document.getElementById("btnScanCashier");
const btnCloseScanner = document.getElementById("btnCloseScanner");
const scannerModal = document.getElementById("scannerModal");

// ===================================
// UTILITIES
// ===================================
function formatRupiah(angka) {
    return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}

function getItemById(id) {
    return items.find(item => item.id === id);
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

// ===================================
// DATABASE SERVICES
// ===================================
async function loadDataSupabase() {
    const { data, error } = await supabaseClient
        .from("barang")
        .select("*")
        .order("id");

    if (error) {
        console.error(error);
        alert("Gagal memuat daftar barang!");
        return;
    }

    items = (data || []).map(item => ({
        id: item.id,
        name: item.nama_barang || item.nama,
        stock: item.stok,
        sellPrice: item.harga_jual,
        code: item.barcode
    }));
}

async function generateTransactionCode() {
    const { count, error } = await supabaseClient
        .from("transaksi")
        .select("*", { count: "exact", head: true });

    if (error) {
        console.error(error);
        return "TRX-" + Date.now();
    }

    return "TRX-" + String((count || 0) + 1).padStart(6, "0");
}

// ===================================
// CART OPERATIONS
// ===================================
function addToCart(itemId) {
    const inventoryItem = getItemById(itemId);
    if (!inventoryItem) return;

    const existingItem = cart.find(item => item.id === itemId);

    if (existingItem) {
        if (existingItem.qty >= inventoryItem.stock) {
            return alert("Stok tidak mencukupi!");
        }
        existingItem.qty++;
    } else {
        if (inventoryItem.stock <= 0) {
            return alert("Barang habis!");
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
    const cartItem = cart.find(item => item.id === itemId);
    const inventoryItem = getItemById(itemId);

    if (!cartItem || !inventoryItem) return;

    if (cartItem.qty >= inventoryItem.stock) {
        return alert("Stok tidak mencukupi!");
    }

    cartItem.qty++;
    renderCart();
}

function decreaseCartQty(itemId) {
    const index = cart.findIndex(item => item.id === itemId);
    if (index === -1) return;

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

// ===================================
// CHECKOUT & PAYMENT
// ===================================
function updatePayment() {
    const payment = parseInt(paymentInput.value, 10) || 0;
    const total = getCartTotal();
    const change = payment - total;

    if (change < 0) {
        changeTotal.textContent = "Uang Kurang";
    } else {
        changeTotal.textContent = formatRupiah(change);
    }
}

async function checkout() {
    if (cart.length === 0) return alert("Keranjang masih kosong!");

    const total = getCartTotal();
    const payment = parseInt(paymentInput.value, 10);

    if (isNaN(payment)) return alert("Masukkan jumlah pembayaran!");
    if (payment < total) return alert("Uang pembayaran kurang!");

    const change = payment - total;

    checkoutButton.disabled = true;
    checkoutButton.textContent = "Memproses...";

    for (const cartItem of cart) {
        const item = getItemById(cartItem.id);
        if (!item || item.stock < cartItem.qty) {
            alert(`Stok produk "${cartItem.name}" tidak mencukupi!`);
            checkoutButton.disabled = false;
            checkoutButton.textContent = "💳 Bayar";
            return;
        }
    }

    for (const cartItem of cart) {
        const item = getItemById(cartItem.id);
        const newStock = item.stock - cartItem.qty;

        const { error: stockError } = await supabaseClient
            .from("barang")
            .update({ stok: newStock })
            .eq("id", item.id);

        if (stockError) {
            console.error(stockError);
            alert("Gagal mengurangi stok barang: " + item.name);
            checkoutButton.disabled = false;
            checkoutButton.textContent = "💳 Bayar";
            return;
        }
    }

    const transactionCode = await generateTransactionCode();
    const newTransaction = {
        kode_transaksi: transactionCode,
        item: cart,
        total,
        bayar: payment,
        kembalian: change,
        tanggal: new Date().toISOString()
    };

    const { error: transactionError } = await supabaseClient
        .from("transaksi")
        .insert([newTransaction]);

    checkoutButton.disabled = false;
    checkoutButton.textContent = "💳 Bayar";

    if (transactionError) {
        console.error(transactionError);
        alert("Gagal menyimpan transaksi!");
        return;
    }

    paymentInput.value = "";
    changeTotal.textContent = formatRupiah(0);
    clearCart();

    await loadDataSupabase();
    renderCashierItems();

    window.location.href = `receipt.html?id=${transactionCode}`;
}

// ===================================
// RENDERERS & ELEMENTS
// ===================================
function renderCashierItems() {
    cashierItems.replaceChildren();
    items.forEach((item) => {
        cashierItems.appendChild(createCashierCard(item));
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
    stock.textContent = `Stok : ${item.stock}`;

    const addButton = document.createElement("button");
    addButton.textContent = "➕ Tambah";
    addButton.addEventListener("click", () => addToCart(item.id));

    card.append(title, price, stock, addButton);
    return card;
}

function renderCart() {
    cartItems.replaceChildren();
    cart.forEach((item) => {
        cartItems.appendChild(createCartItem(item));
    });
    cartTotal.textContent = formatRupiah(getCartTotal());
}

function createCartItem(item) {
    const li = document.createElement("li");

    const title = document.createElement("strong");
    title.textContent = item.name;

    const subtotal = document.createElement("p");
    subtotal.textContent = formatRupiah(item.price * item.qty);

    const controls = document.createElement("div");
    controls.className = "stock-controls";

    const minusBtn = document.createElement("button");
    minusBtn.textContent = "➖";
    minusBtn.addEventListener("click", () => decreaseCartQty(item.id));

    const qty = document.createElement("strong");
    qty.className = "stock-text";
    qty.textContent = item.qty;

    const plusBtn = document.createElement("button");
    plusBtn.textContent = "➕";
    plusBtn.addEventListener("click", () => increaseCartQty(item.id));

    controls.append(minusBtn, qty, plusBtn);
    li.append(title, subtotal, controls);

    return li;
}

// ===================================
// BARCODE SCANNER
// ===================================
function openScanner() {
    scannerModal.classList.add("show");
    html5QrCode = new Html5Qrcode("scannerReader");
    
    const config = { 
        fps: 10, 
        qrbox: { width: 260, height: 130 } 
    };

    html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
            const foundItem = items.find(item => item.code === decodedText);
            if (!foundItem) {
                alert(`Barang dengan barcode "${decodedText}" tidak ditemukan!`);
            } else {
                addToCart(foundItem.id);
            }
            closeScanner();
        },
        () => {}
    ).catch((err) => {
        console.error(err);
        alert("Kamera tidak bisa diakses!");
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

// ===================================
// INITIALIZATION
// ===================================
function setupEventListeners() {
    checkoutButton.addEventListener("click", checkout);
    if (paymentInput) paymentInput.addEventListener("input", updatePayment);
    if (btnScanCashier) btnScanCashier.addEventListener("click", openScanner);
    if (btnCloseScanner) btnCloseScanner.addEventListener("click", closeScanner);
}

async function init() {
    await loadDataSupabase();
    renderCashierItems();
    renderCart();
    setupEventListeners();
}

init();