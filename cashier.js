// ===================================
// DATA
// ===================================

let items = [];
let cart = [];
let transactions = [];


// ===================================
// STORAGE
// ===================================

loadData()

saveTransactions()

generateTransactionCode()


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