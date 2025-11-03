// script-v2.js - enhanced interactions for v2

// Toast helper
function showToast(msg, type="info", timeout=3000){
  const wrap = document.getElementById('toastWrap') || document.getElementById('toastWrapDash') || document.getElementById('toastWrapStock') || document.getElementById('toastWrapTrack') || document.getElementById('toastWrapCheckout') || document.getElementById('toastWrap');
  if(!wrap) return;
  const t = document.createElement('div');
  t.className = 'toast card p-2 mb-2';
  t.style.minWidth = '220px';
  t.innerHTML = `<div style="font-weight:600">${msg}</div>`;
  wrap.appendChild(t);
  setTimeout(()=> t.style.opacity = '0', timeout-400);
  setTimeout(()=> t.remove(), timeout);
}

// theme toggle with persistence
function initTheme(){
  const current = localStorage.getItem('theme') || 'light';
  if(current === 'dark') document.documentElement.setAttribute('data-theme','dark');
  document.querySelectorAll('#themeToggle, #themeToggleDash').forEach(el=>{
    el && el.addEventListener('click', ()=>{
      const now = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', now === 'dark' ? 'dark' : 'light');
      localStorage.setItem('theme', now);
    });
  });
}

// load data and common functions
function rupiahFromString(s){ const n = s.replace(/[^0-9]/g,""); return parseInt(n)||0; }
function numberWithDots(x){ return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function formatRupiah(n){ return "Rp " + numberWithDots(n); }

document.addEventListener('DOMContentLoaded', function(){

  initTheme();

  // login logic (same as before)
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const pass = document.getElementById('password').value.trim();
      const user = dataPengguna.find(u=>u.email===email);
      if(!user || user.password !== pass){
        showToast('email/password yang anda masukkan salah');
        return;
      }
      sessionStorage.setItem('loggedUser', JSON.stringify({id:user.id,nama:user.nama,email:user.email,role:user.role}));
      showToast('Login berhasil, selamat datang '+user.nama);
      setTimeout(()=> location.href = '../dashboard/dashboard.html', 700);
    });
    document.getElementById('doRegister') && document.getElementById('doRegister').addEventListener('click', function(){
      showToast('Pendaftaran simulasi selesai. Silakan login.');
      bootstrap.Modal.getInstance(document.getElementById('registerModal'))?.hide();
    });
    document.getElementById('sendRecovery') && document.getElementById('sendRecovery').addEventListener('click', function(){
      showToast('Email instruksi pemulihan telah dikirim (simulasi).');
      bootstrap.Modal.getInstance(document.getElementById('forgotModal'))?.hide();
    });
  }

  // dashboard greetings & recommendations
  const greetEl = document.getElementById('greeting');
  if(greetEl){
    const user = JSON.parse(sessionStorage.getItem('loggedUser') || 'null');
    const hr = new Date().getHours();
    let part = 'Selamat Malam';
    if(hr>=4 && hr<11) part = 'Selamat Pagi';
    else if(hr>=11 && hr<15) part = 'Selamat Siang';
    else if(hr>=15 && hr<18) part = 'Selamat Sore';
    greetEl.textContent = `${part}${user?(', '+user.nama+'!'):''}`;
    if(user) document.getElementById('userRole').textContent = `Role: ${user.role}`;
    // fill recGrid with top 3
    const rec = document.getElementById('recGrid');
    if(rec){
      dataKatalogBuku.slice(0,6).forEach(b=>{
        const div = document.createElement('div');
        div.className = 'card p-2';
        div.innerHTML = `<img class="book-cover" src="../${b.cover}" alt="${b.namaBarang}"><div class="book-title">${b.namaBarang}</div><div class="book-meta">${b.jenisBarang} • ${b.edisi} • ${b.harga}</div><div class="mt-2"><button class="btn-primary btn-icon" onclick="quickAdd('${b.kodeBarang}')">Pesan</button></div>`;
        rec.appendChild(div);
      });
    }
  }

  // catalog render (grid)
  const catalogGrid = document.getElementById('catalogGrid');
  if(catalogGrid){
    function renderGrid(){
      catalogGrid.innerHTML = '';
      dataKatalogBuku.forEach((b,i)=>{
        const div = document.createElement('div');
        div.innerHTML = `<div class="card"><img class="book-cover" src="../${b.cover}" alt="${b.namaBarang}"><div style="padding:8px;"><div class="book-title">${b.namaBarang}</div><div class="book-meta">${b.jenisBarang} • Edisi ${b.edisi}</div><div class="d-flex justify-content-between align-items-center mt-2"><div class="small muted">${b.stok} stok</div><div><button class="btn-outline btn-icon me-2" onclick="viewDetail(${i})">Detail</button><button class="btn-primary" onclick="quickAdd('${b.kodeBarang}')">Pesan</button></div></div></div></div>`;
        catalogGrid.appendChild(div);
      });
    }
    renderGrid();
    document.getElementById('addStockBtn').addEventListener('click', function(){ new bootstrap.Modal(document.getElementById('modalAddStock')).show(); });
    document.getElementById('saveNewStock').addEventListener('click', function(){
      const kode = document.getElementById('newKode').value.trim();
      const nama = document.getElementById('newNama').value.trim();
      const stok = parseInt(document.getElementById('newStok').value)||0;
      const harga = document.getElementById('newHarga').value.trim()||'Rp 0';
      const cover = document.getElementById('newCover').value.trim()||'../img/pengantar_komunikasi.jpg';
      if(!kode || !nama){ showToast('Kode dan nama wajib diisi'); return; }
      dataKatalogBuku.push({kodeBarang:kode,namaBarang:nama,jenisBarang:'Buku',edisi:'1',stok:stok,harga:harga,cover:cover.replace('../','')});
      renderGrid();
      bootstrap.Modal.getInstance(document.getElementById('modalAddStock'))?.hide();
      showToast('Stok baru berhasil ditambahkan');
    });
  }

  // tracking
  const btnSearch = document.getElementById('searchDO');
  if(btnSearch){
    btnSearch.addEventListener('click', function(){
      const val = document.getElementById('doNumber').value.trim();
      const res = dataTracking[val];
      if(!res){ showToast('Nomor tidak ditemukan'); return; }
      document.getElementById('trackingResult').style.display='block';
      document.getElementById('trackName').textContent = res.nama;
      document.getElementById('trackEkspedisi').textContent = res.ekspedisi;
      document.getElementById('trackTanggal').textContent = res.tanggalKirim;
      const bar = document.getElementById('trackProgress');
      let pct = 25;
      if(res.status.toLowerCase().includes('dikirim')) pct = 60;
      if(res.status.toLowerCase().includes('selesai')||res.status.toLowerCase().includes('terima')) pct = 100;
      bar.style.width = pct + '%';
      bar.textContent = pct + '%';
      const ul = document.getElementById('trackList'); ul.innerHTML='';
      res.perjalanan.forEach(p=>{
        const li = document.createElement('li'); li.className='list-group-item';
        li.innerHTML = `<div style="font-weight:600">${p.waktu}</div><div class="small muted">${p.keterangan}</div>`;
        ul.appendChild(li);
      });
      showToast('Tracking ditemukan: '+res.status);
    });
  }

  // checkout
  const selectBook = document.getElementById('selectBook');
  if(selectBook){
    dataKatalogBuku.forEach((b,i)=>{ const opt=document.createElement('option'); opt.value=i; opt.textContent=`${b.namaBarang} — ${b.harga}`; selectBook.appendChild(opt); });
    const order = [];
    function updateOrderTable(){
      const tbody = document.querySelector('#orderTable tbody'); tbody.innerHTML=''; let total=0;
      order.forEach((it,idx)=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${it.nama}</td><td>${it.harga}</td><td><input type="number" min="1" value="${it.qty}" class="form-control qtyInput" data-idx="${idx}"></td><td class="sub">${it.sub}</td><td><button class="btn-outline removeBtn" data-idx="${idx}">Hapus</button></td>`;
        tbody.appendChild(tr);
        total += rupiahFromString(it.sub);
      });
      document.getElementById('totalOrder').textContent = formatRupiah(total);
      document.querySelectorAll('.removeBtn').forEach(b=>b.addEventListener('click', function(){ order.splice(parseInt(this.dataset.idx),1); updateOrderTable(); }));
      document.querySelectorAll('.qtyInput').forEach(inp=> inp.addEventListener('change', function(){ const i=parseInt(this.dataset.idx); const v=parseInt(this.value)||1; order[i].qty=v; order[i].sub = formatRupiah(rupiahFromString(order[i].harga)*v); updateOrderTable(); }));
    }
    document.getElementById('addToOrder').addEventListener('click', function(){
      const idx=parseInt(selectBook.value); const qty=parseInt(document.getElementById('qtyBook').value)||1; const book=dataKatalogBuku[idx];
      const item = {kode:book.kodeBarang, nama:book.namaBarang, harga:book.harga, qty:qty, sub: formatRupiah(rupiahFromString(book.harga)*qty)};
      order.push(item); updateOrderTable(); showToast('Item ditambahkan ke order');
    });
    document.getElementById('placeOrder').addEventListener('click', function(){
      const name=document.getElementById('custName').value.trim(); const email=document.getElementById('custEmail').value.trim();
      if(!name||!email){ showToast('Nama dan Email wajib diisi'); return; }
      showToast('Order berhasil dibuat. Terima kasih!');
      document.querySelector('#orderTable tbody').innerHTML=''; document.getElementById('totalOrder').textContent='Rp 0';
    });
  }

}); // DOMContentLoaded

// quick helpers accessible globally
function quickAdd(kode){
  // find book by kode and redirect to checkout with prefill via sessionStorage
  const book = dataKatalogBuku.find(b=>b.kodeBarang===kode);
  if(!book){ showToast('Buku tidak ditemukan'); return; }
  // store a short cart
  const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
  cart.push({kode:book.kodeBarang, nama:book.namaBarang, harga:book.harga, qty:1, sub:book.harga});
  sessionStorage.setItem('cart', JSON.stringify(cart));
  showToast('Buku ditambahkan ke keranjang. Buka halaman Checkout.');
  setTimeout(()=> location.href='../checkout/checkout.html', 700);
}

function viewDetail(i){
  const b = dataKatalogBuku[i];
  alert(`${b.namaBarang}\nJenis: ${b.jenisBarang}\nEdisi: ${b.edisi}\nStok: ${b.stok}\nHarga: ${b.harga}`);
}
