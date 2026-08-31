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
// DOM ELEMENTS & STATE
// ===================================
let items = [];
let currentUploadedFile = null;
let currentUploadedUrl = "";

const itemForm = document.getElementById("itemForm");
const formTitle = document.getElementById("formTitle");
const itemIdInput = document.getElementById("itemId");
const itemImageUrlInput = document.getElementById("itemImageUrl");
const namaBarangInput = document.getElementById("namaBarang");
const stokBarangInput = document.getElementById("stokBarang");
const hargaBeliInput = document.getElementById("hargaBeli");
const hargaJualInput = document.getElementById("hargaJual");
const kategoriInput = document.getElementById("kategoriBarang");
const btnSubmit = document.getElementById("btnSubmit");
const btnCancel = document.getElementById("btnCancel");
const itemList = document.getElementById("itemList");
const searchInput = document.getElementById("searchInput");

// Modal & OCR Elements
const cameraInput = document.getElementById("cameraInput");
const statusOCR = document.getElementById("statusOCR");
const photoOptionModal = document.getElementById("photoOptionModal");
const modalImagePreview = document.getElementById("modalImagePreview");
const btnOptionNew = document.getElementById("btnOptionNew");
const btnOptionExisting = document.getElementById("btnOptionExisting");
const btnOptionCancel = document.getElementById("btnOptionCancel");
const existingProductForm = document.getElementById("existingProductForm");
const selectExistingItem = document.getElementById("selectExistingItem");
const addQtyInput = document.getElementById("addQtyInput");
const btnSubmitAddStock = document.getElementById("btnSubmitAddStock");

// ===================================
// UTILITIES
// ===================================
function formatRupiah(angka) {
    return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (toast) {
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    } else {
        alert(message);
    }
}

function generateItemCode(item) {
    if (item.barcode) return item.barcode;
    
    let prefix = "BRG";
    if (item.kategori) {
        prefix = item.kategori.substring(0, 3).toUpperCase();
    } else if (item.nama_barang) {
        prefix = item.nama_barang.substring(0, 3).toUpperCase();
    }
    
    const paddedId = String(item.id || Date.now()).padStart(4, "0");
    return `${prefix}-${paddedId}`;
}

// ===================================
// OCR PROCESSOR (TESSERACT.JS)
// ===================================
async function processOCR(file) {
    if (!statusOCR) return;

    statusOCR.style.display = 'block';
    statusOCR.style.color = '#333';
    statusOCR.innerText = '⏳ Memulai pemrosesan gambar...';

    try {
        if (typeof Tesseract === 'undefined') {
            throw new Error('Library Tesseract.js belum terkonfigurasi di index.html');
        }

        const result = await Tesseract.recognize(
            file,
            'ind+eng',
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const persen = Math.round(m.progress * 100);
                        statusOCR.innerText = `⏳ Membaca teks kemasan: ${persen}%`;
                    }
                }
            }
        );

        let rawText = result.data.text || "";
        
        let lines = rawText
            .split('\n')
            .map(line => line.replace(/[^a-zA-Z0-9\s]/g, '').trim())
            .filter(line => line.length > 2);

        if (lines.length > 0) {
            let predictedName = lines.slice(0, 2).join(' ');
            
            if (namaBarangInput) {
                namaBarangInput.value = predictedName;
            }

            statusOCR.style.color = 'green';
            statusOCR.innerText = `✅ Teks terdeteksi: "${predictedName}". Silakan rapikan jika perlu.`;
        } else {
            statusOCR.style.color = 'orange';
            statusOCR.innerText = '⚠️ Teks tidak terdeteksi. Silakan ketik nama barang secara manual.';
        }
    } catch (error) {
        console.error('Error OCR:', error);
        statusOCR.style.color = 'red';
        statusOCR.innerText = '❌ Gagal membaca foto. Pastikan dibuka via Live Server atau Web Hosting.';
    }
}

// ===================================
// PRINT LABEL STIKER (WITH BARCODE)
// ===================================
function printLabel(item) {
    const printWindow = window.open('', '_blank', 'width=400,height=400');
    if (!printWindow) {
        alert("Pop-up diblokir! Harap izinkan pop-up di browser Anda.");
        return;
    }

    const itemCode = generateItemCode(item);

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Label - ${item.nama_barang}</title>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
            <style>
                @page {
                    size: 50mm 30mm;
                    margin: 0;
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 4px;
                    text-align: center;
                    box-sizing: border-box;
                }
                .store {
                    font-size: 8px;
                    font-weight: bold;
                    color: #555;
                    text-transform: uppercase;
                }
                .title {
                    font-size: 10px;
                    font-weight: bold;
                    margin: 1px 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .price {
                    font-size: 13px;
                    font-weight: bold;
                    color: #000;
                    margin: 1px 0;
                }
                #barcode {
                    width: 90%;
                    height: 35px;
                    margin-top: 2px;
                }
            </style>
        </head>
        <body>
            <div class="store">Toko Ibu Irma</div>
            <div class="title">${item.nama_barang}</div>
            <div class="price">${formatRupiah(item.harga_jual)}</div>
            <svg id="barcode"></svg>

            <script>
                function doPrint() {
                    try {
                        JsBarcode("#barcode", "${itemCode}", {
                            format: "CODE128",
                            lineColor: "#000",
                            width: 2,
                            height: 35,
                            displayValue: true,
                            fontSize: 10,
                            margin: 0
                        });
                    } catch (e) {
                        console.error("Gagal generate barcode:", e);
                    }

                    window.print();
                    window.close();
                }

                if (document.readyState === 'complete') {
                    doPrint();
                } else {
                    window.onload = doPrint;
                }
            <\/script>
        </body>
        </html>
    `);

    printWindow.document.close();
}

// ===================================
// DATABASE OPERATIONS
// ===================================
async function loadItems() {
    const { data, error } = await supabaseClient
        .from("barang")
        .select("*")
        .order("nama_barang", { ascending: true });

    if (error) {
        console.error("Gagal memuat barang:", error);
        showToast("Gagal mengambil data stok!");
        return;
    }

    items = data || [];
    renderItems();
}

async function uploadImageToSupabase(file) {
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const { data, error } = await supabaseClient.storage
        .from("produk-image")
        .upload(fileName, file);

    if (error) {
        console.error("Gagal unggah foto:", error);
        return null;
    }

    const { data: publicUrlData } = supabaseClient.storage
        .from("produk-image")
        .getPublicUrl(fileName);

    return publicUrlData ? publicUrlData.publicUrl : null;
}

// ===================================
// RENDERERS
// ===================================
function renderItems() {
    if (!itemList) return;
    itemList.replaceChildren();
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const filtered = items.filter(item => 
        (item.nama_barang || "").toLowerCase().includes(keyword) ||
        (item.kategori || "").toLowerCase().includes(keyword)
    );

    if (filtered.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.style.textAlign = "center";
        emptyMsg.style.color = "var(--text-muted)";
        emptyMsg.textContent = "Barang tidak ditemukan.";
        itemList.appendChild(emptyMsg);
        return;
    }

    filtered.forEach(item => {
        const card = createItemCard(item);
        itemList.appendChild(card);
    });
}

function createItemCard(item) {
    const card = document.createElement("div");
    card.className = "item-card";
    card.style.display = "flex";
    card.style.justifyContent = "space-between";
    card.style.alignItems = "center";
    card.style.padding = "12px";
    card.style.marginBottom = "10px";
    card.style.background = "#fff";
    card.style.borderRadius = "8px";
    card.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";

    const infoBox = document.createElement("div");
    
    const title = document.createElement("h3");
    title.style.margin = "0 0 4px 0";
    title.textContent = `${item.nama_barang} [${generateItemCode(item)}]`;

    const stok = document.createElement("p");
    stok.style.margin = "0";
    stok.style.fontSize = "14px";
    stok.style.color = "var(--text-muted)";
    stok.textContent = `Stok: ${item.stok}`;

    const harga = document.createElement("p");
    harga.style.margin = "4px 0 0 0";
    harga.style.fontWeight = "bold";
    harga.style.color = "var(--primary)";
    harga.textContent = `Jual: ${formatRupiah(item.harga_jual)} | Modal: ${formatRupiah(item.harga_beli)}`;

    infoBox.append(title, stok, harga);

    const actionBox = document.createElement("div");
    actionBox.style.display = "flex";
    actionBox.style.gap = "6px";
    actionBox.style.flexWrap = "wrap";

    const btnLabel = document.createElement("button");
    btnLabel.className = "btn";
    btnLabel.style.background = "#27ae60";
    btnLabel.style.color = "#fff";
    btnLabel.textContent = "🏷️ Label";
    btnLabel.addEventListener("click", () => printLabel(item));

    const btnEdit = document.createElement("button");
    btnEdit.className = "btn btn-secondary";
    btnEdit.textContent = "✏️ Edit";
    btnEdit.addEventListener("click", () => populateForm(item));

    const btnDelete = document.createElement("button");
    btnDelete.className = "btn";
    btnDelete.style.background = "#e74c3c";
    btnDelete.style.color = "#fff";
    btnDelete.textContent = "🗑️ Hapus";
    btnDelete.addEventListener("click", () => deleteItem(item.id, item.nama_barang));

    actionBox.append(btnLabel, btnEdit, btnDelete);
    card.append(infoBox, actionBox);

    return card;
}

function populateForm(item) {
    formTitle.textContent = "✏️ Edit Barang";
    itemIdInput.value = item.id;
    itemImageUrlInput.value = item.image_url || "";
    namaBarangInput.value = item.nama_barang;
    stokBarangInput.value = item.stok;
    hargaBeliInput.value = item.harga_beli;
    hargaJualInput.value = item.harga_jual;
    if (kategoriInput) kategoriInput.value = item.kategori || "";

    btnSubmit.textContent = "Simpan Perubahan";
    btnCancel.style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
    formTitle.textContent = "➕ Tambah Barang Baru";
    itemIdInput.value = "";
    itemImageUrlInput.value = "";
    if (itemForm) itemForm.reset();

    btnSubmit.textContent = "Simpan Barang";
    btnCancel.style.display = "none";
    currentUploadedFile = null;
    currentUploadedUrl = "";
    if (statusOCR) statusOCR.style.display = "none";
}

// ===================================
// EVENT HANDLERS & LOGIC
// ===================================
async function handleSubmit(e) {
    e.preventDefault();

    const id = itemIdInput.value;
    const nama_barang = namaBarangInput.value.trim();
    const stok = parseInt(stokBarangInput.value, 10);
    const harga_beli = parseFloat(hargaBeliInput.value);
    const harga_jual = parseFloat(hargaJualInput.value);
    const kategori = kategoriInput ? kategoriInput.value.trim() : "";

    let image_url = itemImageUrlInput.value;

    if (currentUploadedFile) {
        showToast("Mengunggah gambar...");
        const uploadedUrl = await uploadImageToSupabase(currentUploadedFile);
        if (uploadedUrl) image_url = uploadedUrl;
    }

    const prefix = kategori ? kategori.substring(0, 3).toUpperCase() : nama_barang.substring(0, 3).toUpperCase();
    const generatedBarcode = `${prefix}-${String(id || Date.now()).slice(-4)}`;

    const payload = { 
        nama_barang, 
        stok, 
        harga_beli, 
        harga_jual, 
        image_url,
        kategori,
        barcode: generatedBarcode
    };

    if (id) {
        const { error } = await supabaseClient
            .from("barang")
            .update(payload)
            .eq("id", id);

        if (error) {
            console.error(error);
            showToast("Gagal memperbarui barang!");
            return;
        }
        showToast("Barang berhasil diperbarui!");
    } else {
        const { error } = await supabaseClient
            .from("barang")
            .insert([payload]);

        if (error) {
            console.error(error);
            showToast("Gagal menambah barang!");
            return;
        }
        showToast("Barang baru berhasil ditambahkan!");
    }

    resetForm();
    await loadItems();
}

async function deleteItem(id, name) {
    if (!confirm(`Yakin ingin menghapus "${name}"?`)) return;

    const { error } = await supabaseClient
        .from("barang")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        showToast("Gagal menghapus barang!");
        return;
    }

    showToast("Barang berhasil dihapus!");
    await loadItems();
}

// Handler Foto Kamera (Langsung Panggil OCR Otomatis)
if (cameraInput) {
    cameraInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        currentUploadedFile = file;

        // 1. Tampilkan Preview Modal
        const reader = new FileReader();
        reader.onload = function(evt) {
            modalImagePreview.src = evt.target.result;
            existingProductForm.style.display = "none";
            photoOptionModal.style.display = "flex";
        };
        reader.readAsDataURL(file);

        // 2. LANGSUNG EKSEKUSI OCR DI BACKGROUND
        processOCR(file);
    });
}

// Modal Options
if (btnOptionNew) {
    btnOptionNew.addEventListener("click", () => {
        photoOptionModal.style.display = "none";
        
        // Fokuskan ke nama barang & scroll halus ke form
        if (namaBarangInput) namaBarangInput.focus();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

if (btnOptionExisting) {
    btnOptionExisting.addEventListener("click", () => {
        selectExistingItem.replaceChildren();
        
        if (items.length === 0) {
            alert("Belum ada daftar barang!");
            return;
        }

        items.forEach(item => {
            const opt = document.createElement("option");
            opt.value = item.id;
            opt.textContent = `${item.nama_barang} (Stok Saat Ini: ${item.stok})`;
            selectExistingItem.appendChild(opt);
        });

        existingProductForm.style.display = "block";
    });
}

if (btnOptionCancel) {
    btnOptionCancel.addEventListener("click", () => {
        photoOptionModal.style.display = "none";
        currentUploadedFile = null;
        if (statusOCR) statusOCR.style.display = "none";
    });
}

if (btnSubmitAddStock) {
    btnSubmitAddStock.addEventListener("click", async () => {
        const selectedId = selectExistingItem.value;
        const addQty = parseInt(addQtyInput.value, 10) || 0;

        const targetItem = items.find(i => i.id == selectedId);
        if (!targetItem) return;

        const newStok = (targetItem.stok || 0) + addQty;

        const { error } = await supabaseClient
            .from("barang")
            .update({ stok: newStok })
            .eq("id", selectedId);

        if (error) {
            console.error(error);
            showToast("Gagal menambah stok!");
            return;
        }

        showToast(`Stok ${targetItem.nama_barang} berhasil ditambahkan!`);
        photoOptionModal.style.display = "none";
        await loadItems();
    });
}

// ===================================
// INITIALIZATION
// ===================================
function init() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                registration.unregister();
            }
        });
    }

    if (itemForm) itemForm.addEventListener("submit", handleSubmit);
    if (btnCancel) btnCancel.addEventListener("click", resetForm);
    if (searchInput) searchInput.addEventListener("input", renderItems);

    loadItems();
}

init();