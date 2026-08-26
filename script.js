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
const btnSubmit = document.getElementById("btnSubmit");
const btnCancel = document.getElementById("btnCancel");
const itemList = document.getElementById("itemList");
const searchInput = document.getElementById("searchInput");

// Modal Elements
const cameraInput = document.getElementById("cameraInput");
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
    itemList.replaceChildren();
    const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const filtered = items.filter(item => 
        (item.nama_barang || "").toLowerCase().includes(keyword)
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
    title.textContent = item.nama_barang;

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
    actionBox.style.gap = "8px";

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

    actionBox.append(btnEdit, btnDelete);
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

    btnSubmit.textContent = "Simpan Perubahan";
    btnCancel.style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
    formTitle.textContent = "➕ Tambah Barang Baru";
    itemIdInput.value = "";
    itemImageUrlInput.value = "";
    itemForm.reset();

    btnSubmit.textContent = "Simpan Barang";
    btnCancel.style.display = "none";
    currentUploadedFile = null;
    currentUploadedUrl = "";
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

    let image_url = itemImageUrlInput.value;

    // Unggah gambar jika ada file foto baru
    if (currentUploadedFile) {
        showToast("Mengunggah gambar...");
        const uploadedUrl = await uploadImageToSupabase(currentUploadedFile);
        if (uploadedUrl) image_url = uploadedUrl;
    }

    const payload = { nama_barang, stok, harga_beli, harga_jual, image_url };

    if (id) {
        // Update Barang
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
        // Tambah Barang Baru
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

// Handler Foto Kamera
cameraInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    currentUploadedFile = file;
    const reader = new FileReader();
    reader.onload = function(evt) {
        modalImagePreview.src = evt.target.result;
        existingProductForm.style.display = "none";
        photoOptionModal.style.display = "flex";
    };
    reader.readAsDataURL(file);
});

// Modal Option 1: Tambah Barang Baru
btnOptionNew.addEventListener("click", () => {
    photoOptionModal.style.display = "none";
    resetForm();
    namaBarangInput.focus();
});

// Modal Option 2: Tambah ke Barang yang Sudah Ada
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

// Modal Cancel
btnOptionCancel.addEventListener("click", () => {
    photoOptionModal.style.display = "none";
    currentUploadedFile = null;
});

// Submit Update Stok Barang Lama
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

// ===================================
// INITIALIZATION
// ===================================
function init() {
    itemForm.addEventListener("submit", handleSubmit);
    btnCancel.addEventListener("click", resetForm);
    if (searchInput) searchInput.addEventListener("input", renderItems);
    
    loadItems();
}

init();