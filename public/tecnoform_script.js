// =============================================
// PRODUCTOS — se cargan desde la base de datos
// Si la BD no tiene productos, se usan los demo
// =============================================
const PRODUCTOS_DEMO = [
  { id:1,  cat:'ram',     imagen_url:'kingston8gb.png',  nombre:'Kingston 8GB DDR4 3200MHz',    spec:'DDR4 · 3200 MHz · CL22 · 1 módulo',         precio:'$18.500',  stock:'ok'    },
  { id:2,  cat:'ram',     imagen_url:'corsair16gb.png',  nombre:'Corsair 16GB DDR4 3600MHz',    spec:'DDR4 · 3600 MHz · CL18 · Kit 2x8 GB',       precio:'$42.000',  stock:'ok'    },
  { id:3,  cat:'ram',     imagen_url:'kingstong32gb.png',nombre:'Kingston 32GB DDR5 5200MHz',   spec:'DDR5 · 5200 MHz · CL42 · Kit 2x16 GB',      precio:'$89.000',  stock:'pocas' },
  { id:4,  cat:'ssd',     imagen_url:'nvnme.png',        nombre:'Kingston NV2 500GB M.2 NVMe',  spec:'M.2 2280 · NVMe · R: 3500 MB/s',            precio:'$31.000',  stock:'ok'    },
  { id:5,  cat:'ssd',     imagen_url:'samsung.png',      nombre:'Samsung 870 EVO 1TB SATA',     spec:'SATA III · R: 560 MB/s · 2.5"',             precio:'$58.000',  stock:'ok'    },
  { id:6,  cat:'ssd',     imagen_url:'wdblack.png',      nombre:'WD Black SN770 1TB NVMe',      spec:'M.2 2280 · NVMe · R: 5150 MB/s',            precio:'$74.000',  stock:'pocas' },
  { id:7,  cat:'teclado', imagen_url:'k552.png',         nombre:'Redragon K552 TKL RGB',        spec:'Mecánico · Switch Red · TKL · USB',          precio:'$22.000',  stock:'ok'    },
  { id:8,  cat:'teclado', imagen_url:'mk470.png',        nombre:'Logitech MK470 Inalámbrico',   spec:'Membrana · 2.4 GHz · Full size + mouse',    precio:'$28.500',  stock:'ok'    },
  { id:9,  cat:'teclado', imagen_url:'alloy.png',        nombre:'HyperX Alloy Core RGB',        spec:'Membrana · RGB · Anti-ghosting · USB',      precio:'$19.000',  stock:'pocas' },
  { id:10, cat:'mouse',   imagen_url:'g203.png',         nombre:'Logitech G203 LIGHTSYNC',      spec:'8000 DPI · 6 botones · USB · RGB',          precio:'$14.500',  stock:'ok'    },
  { id:11, cat:'mouse',   imagen_url:'razer.png',        nombre:'Razer DeathAdder V2',          spec:'20000 DPI · Óptico · USB · Ergonómico',     precio:'$38.000',  stock:'pocas' },
  { id:12, cat:'monitor', imagen_url:'lg.png',           nombre:'LG 24MR400 24" FHD IPS',       spec:'1920x1080 · 100Hz · IPS · HDMI+VGA',        precio:'$142.000', stock:'ok'    },
  { id:13, cat:'monitor', imagen_url:'samsung5.png',     nombre:'Samsung 27" QHD 165Hz Curvo',  spec:'2560x1440 · 165Hz · VA · HDMI+DP',          precio:'$298.000', stock:'pocas' },
];

let PRODUCTOS = [];

function imgTag(p) {
  if (p.imagen_url) {
    return `<img src="${p.imagen_url}" style="width:100%;height:140px;object-fit:contain;" onerror="this.style.display='none'">`;
  }
  return '<div style="width:100%;height:140px;display:flex;align-items:center;justify-content:center;font-size:3rem;">📦</div>';
}

function renderProductos(cat) {
  const grid = document.getElementById('prodGrid');
  const lista = cat === 'todos' ? PRODUCTOS : PRODUCTOS.filter(p => p.cat === cat);
  if (!lista.length) {
    grid.innerHTML = '<p style="text-align:center;color:#aaa;padding:2rem;">No hay productos en esta categoría.</p>';
    return;
  }
  grid.innerHTML = lista.map(p => `
    <div class="prod-card">
      <div class="prod-img">${imgTag(p)}</div>
      <div class="prod-body">
        <h4>${p.nombre}</h4>
        <p class="spec">${p.spec || ''}</p>
        <p class="precio">${p.precio || ''}</p>
        <span class="badge${p.stock==='pocas'?' pocas':''}${p.stock==='sin'?' sin':''}">${p.stock==='ok'?'✓ Stock disponible':p.stock==='pocas'?'⚠ Pocas unidades':'✗ Sin stock'}</span><br><br>
        <button class="prod-cta" onclick="consultar('${p.nombre.replace(/'/g,"\\'")}')">Consultar</button>
      </div>
    </div>`).join('');
}

async function cargarProductos() {
  try {
    const res = await fetch('/api/productos');
    const data = await res.json();
    PRODUCTOS = data.length > 0 ? data : PRODUCTOS_DEMO;
  } catch {
    PRODUCTOS = PRODUCTOS_DEMO;
  }
  renderProductos('todos');
}

function consultar(nombre) {
  document.getElementById('asunto').value = 'Consulta de producto';
  document.getElementById('mensaje').value = 'Hola, me interesa el producto: ' + nombre;
  document.getElementById('contacto').scrollIntoView({behavior:'smooth'});
}

// Catálogo — filtro por categoría (tabs dinámicos desde localStorage)
const CAT_KEY = 'tf_categorias';
const CAT_DEFAULT = [
  { value:'ram', label:'RAM' },
  { value:'ssd', label:'SSD' },
  { value:'teclado', label:'Teclados' },
  { value:'mouse', label:'Mouse' },
  { value:'monitor', label:'Monitores' }
];

function getCatsFrontend() {
  try {
    const raw = localStorage.getItem(CAT_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return CAT_DEFAULT.map(c => ({ ...c }));
}

function buildCatTabs() {
  const container = document.getElementById('catTabs');
  if (!container) return;
  const cats = getCatsFrontend();
  const extra = cats.map(c => `<button class="cat-tab" data-cat="${c.value}">${c.label}</button>`).join('');
  container.innerHTML = `<button class="cat-tab active" data-cat="todos">Todos</button>${extra}`;
  container.querySelectorAll('.cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProductos(btn.dataset.cat);
    });
  });
}

buildCatTabs();

cargarProductos();

// Hamburger — menú móvil
const ham = document.getElementById('hamburger');
const navEl = document.getElementById('navLinks');
ham.addEventListener('click', () => navEl.classList.toggle('open'));
navEl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navEl.classList.remove('open')));

// FAQ — acordeón
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const a = q.nextElementSibling;
    const arrow = q.querySelector('.faq-arrow');
    const isOpen = a.classList.contains('open');
    document.querySelectorAll('.faq-a').forEach(x => x.classList.remove('open'));
    document.querySelectorAll('.faq-arrow').forEach(x => x.classList.remove('open'));
    if (!isOpen) { a.classList.add('open'); arrow.classList.add('open'); }
  });
});

// Formulario de contacto
document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const nombre   = document.getElementById('nombre').value.trim();
  const email    = document.getElementById('email').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const asunto   = document.getElementById('asunto').value;
  const mensaje  = document.getElementById('mensaje').value.trim();
  const msg      = document.getElementById('msg');

  if (!nombre || !email || !mensaje) {
    msg.style.color = 'red';
    msg.textContent = 'Completá los campos obligatorios (*)';
    return;
  }

  try {
    const res = await fetch('/api/consulta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, telefono, asunto, mensaje })
    });
    const data = await res.json();
    if (data.ok) {
      msg.style.color = 'green';
      msg.textContent = '¡Consulta enviada! Te contactaremos pronto.';
      this.reset();
    }
  } catch {
    msg.style.color = 'red';
    msg.textContent = 'Error al enviar. Intentá de nuevo.';
  }
});
