let transactions = [];
let transaction = null;

const transactionCode =
    document.getElementById("transactionCode");

const transactionDate =
    document.getElementById("transactionDate");

const transactionItems =
    document.getElementById("transactionItems");

const totalItems =
    document.getElementById("totalItems");

const transactionTotal =
    document.getElementById("transactionTotal");

const transactionPayment =
    document.getElementById("transactionPayment");

const transactionChange =
    document.getElementById("transactionChange");

const backButton =
    document.getElementById("backButton");


function formatRupiah(value) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(value);

}


function loadTransactions() {

    const data =
        localStorage.getItem(
            "warungkuTransactions"
        );

    if (data) {

        transactions =
            JSON.parse(data);

    }

}


function getTransactionCode() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id");

}


function findTransaction() {

    const code =
        getTransactionCode();

    transaction =
        transactions.find((item) => {

            return (
                item.transactionCode === code
            );

        });

}


function renderTransactionDetail() {

    if (!transaction) {

        transactionCode.textContent =
            "Transaksi tidak ditemukan";

        return;

    }

    transactionCode.textContent =
        transaction.transactionCode;

    transactionDate.textContent =
        transaction.date;

    transactionItems.replaceChildren();

    let itemTotal = 0;

    transaction.items.forEach((item) => {

        itemTotal += item.qty;

        const row =
            document.createElement("div");

        row.className =
            "detail-item";

        const name =
            document.createElement("span");

        name.textContent =
            item.name;

        const quantity =
            document.createElement("span");

        quantity.textContent =
            `${item.qty} × ${formatRupiah(item.price)}`;

        const subtotal =
            document.createElement("strong");

        subtotal.textContent =
            formatRupiah(
                item.qty * item.price
            );

        row.append(
            name,
            quantity,
            subtotal
        );

        transactionItems.appendChild(row);

    });

    totalItems.textContent =
        itemTotal;

    transactionTotal.textContent =
        formatRupiah(
            transaction.total
        );

    transactionPayment.textContent =
        formatRupiah(
            transaction.payment
        );

    transactionChange.textContent =
        formatRupiah(
            transaction.change
        );

}


function init() {

    loadTransactions();

    findTransaction();

    renderTransactionDetail();

}


backButton.addEventListener(
    "click",
    () => {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const source =
            params.get("source");

        if (source === "report") {

            window.location.href =
                "report.html";

            return;

        }

        window.location.href =
            "history.html";

    }
);


init();