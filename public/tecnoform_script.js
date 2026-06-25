// =============================================
// PRODUCTOS DEMO — EDITAR AQUÍ
// campos: cat, emoji, nombre, spec, precio, stock ('ok' | 'pocas' | 'sin')
// =============================================
const PRODUCTOS = [
  { cat:'ram',     emoji:'<img src="kingston8gb.png" style="width:100%;height:140px;object-fit:contain;">', nombre:'Kingston 8GB DDR4 3200MHz',    spec:'DDR4 · 3200 MHz · CL22 · 1 módulo',         precio:'$18.500',  stock:'ok'    },
  { cat:'ram',     emoji:'<img src="corsair16gb.png" style="width:100%;height:140px;object-fit:contain;">', nombre:'Corsair 16GB DDR4 3600MHz',    spec:'DDR4 · 3600 MHz · CL18 · Kit 2x8 GB',       precio:'$42.000',  stock:'ok'    },
  { cat:'ram',     emoji:'<img src="kingstong32gb.png" style="width:100%;height:140px;object-fit:contain;">', nombre:'Kingston 32GB DDR5 5200MHz',   spec:'DDR5 · 5200 MHz · CL42 · Kit 2x16 GB',      precio:'$89.000',  stock:'pocas' },
  { cat:'ssd',     emoji:'<img src="nvnme.png" style="width:100%;height:140px;object-fit:contain;">', nombre:'Kingston NV2 500GB M.2 NVMe',  spec:'M.2 2280 · NVMe · R: 3500 MB/s',            precio:'$31.000',  stock:'ok'    },
  { cat:'ssd',     emoji:'<img src="samsung.png" style="width:100%;height:140px;object-fit:contain;">', nombre:'Samsung 870 EVO 1TB SATA',     spec:'SATA III · R: 560 MB/s · 2.5"',             precio:'$58.000',  stock:'ok'    },
  { cat:'ssd',     emoji:'<img src="wdblack.png" style="width:100%;height:140px;object-fit:contain;">', nombre:'WD Black SN770 1TB NVMe',      spec:'M.2 2280 · NVMe · R: 5150 MB/s',            precio:'$74.000',  stock:'pocas' },
  { cat:'teclado', emoji:'<img src="k552.png" style="width:100%;height:140px;object-fit:contain;">', nombre:'Redragon K552 TKL RGB',        spec:'Mecánico · Switch Red · TKL · USB',          precio:'$22.000',  stock:'ok'    },
  { cat:'teclado', emoji:'<img src="mk470.png" style="width:100%;height:140px;object-fit:contain;">', nombre:'Logitech MK470 Inalámbrico',   spec:'Membrana · 2.4 GHz · Full size + mouse',    precio:'$28.500',  stock:'ok'    },
  { cat:'teclado', emoji:'<img src="alloy.png" style="width:100%;height:140px;object-fit:contain;">', nombre:'HyperX Alloy Core RGB',        spec:'Membrana · RGB · Anti-ghosting · USB',      precio:'$19.000',  stock:'pocas' },
  { cat:'mouse',   emoji:'<img src="g203.png" style="width:100%;height:140px;object-fit:contain;">', nombre:'Logitech G203 LIGHTSYNC',      spec:'8000 DPI · 6 botones · USB · RGB',          precio:'$14.500',  stock:'ok'    },
  { cat:'mouse',   emoji:'<img src="razer.png" style="width:100%;height:140px;object-fit:contain;">', nombre:'Razer DeathAdder V2',          spec:'20000 DPI · Óptico · USB · Ergonómico',     precio:'$38.000',  stock:'pocas' },
  { cat:'monitor', emoji:'<img src="lg.png" style="width:100%;height:140px;object-fit:contain;">', nombre:'LG 24MR400 24&quot FHD IPS',      spec:'1920x1080 · 100Hz · IPS · HDMI+VGA',        precio:'$142.000', stock:'ok'    },
  { cat:'monitor', emoji:'<img src="samsung5.png" style="width:100%;height:140px;object-fit:contain;">', nombre:'Samsung 27&quot QHD 165Hz Curvo', spec:'2560x1440 · 165Hz · VA · HDMI+DP',         precio:'$298.000', stock:'pocas' },
];
// =============================================
// FIN PRODUCTOS
// =============================================

function renderProductos(cat) {
  const grid = document.getElementById('prodGrid');
  const lista = cat === 'todos' ? PRODUCTOS : PRODUCTOS.filter(p => p.cat === cat);
  grid.innerHTML = lista.map(p => `
    <div class="prod-card">
      <div class="prod-img">${p.emoji}</div>
      <div class="prod-body">
        <h4>${p.nombre}</h4>
        <p class="spec">${p.spec}</p>
        <p class="precio">${p.precio}</p>
        <span class="badge${p.stock==='pocas'?' pocas':''}">${p.stock==='ok'?'✓ Stock disponible':'⚠ Pocas unidades'}</span><br><br>
        <button class="prod-cta" onclick="consultar('${p.nombre}')">Consultar</button>
      </div>
    </div>`).join('');
}

function consultar(nombre) {
  document.getElementById('asunto').value = 'Consulta de producto';
  document.getElementById('mensaje').value = 'Hola, me interesa el producto: ' + nombre;
  document.getElementById('contacto').scrollIntoView({behavior:'smooth'});
}

// Catálogo — filtro por categoría
document.querySelectorAll('.cat-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProductos(btn.dataset.cat);
  });
});

renderProductos('todos');

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
  const nombre  = document.getElementById('nombre').value.trim();
  const email   = document.getElementById('email').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const asunto  = document.getElementById('asunto').value;
  const mensaje = document.getElementById('mensaje').value.trim();
  const msg     = document.getElementById('msg');

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
  } catch (err) {
    msg.style.color = 'red';
    msg.textContent = 'Error al enviar. Intentá de nuevo.';
  }
  
});
