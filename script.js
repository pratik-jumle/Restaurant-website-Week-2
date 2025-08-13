// ===== Mobile Menu Toggle =====
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('show'));
}

// ===== Reveal-on-Scroll =====
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// ===== Simple Cart (LocalStorage) =====
let cart = [];
const fmt = n => `₹${n.toFixed(2)}`;

function loadCart(){
  try { cart = JSON.parse(localStorage.getItem('db_cart') || '[]'); if(!Array.isArray(cart)) cart = []; }
  catch { cart = []; }
}
function saveCart(){ localStorage.setItem('db_cart', JSON.stringify(cart)); }
function renderCart(){
  const list = document.querySelector('#cart-items');
  const totalEl = document.querySelector('#cart-total');
  if (!list || !totalEl) return;
  list.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div><strong>${item.name}</strong><br><small>${fmt(item.price)} × ${item.qty}</small></div>
      <div>
        <button class="icon-btn" data-action="dec" data-id="${item.id}">−</button>
        <button class="icon-btn" data-action="inc" data-id="${item.id}">+</button>
        <button class="icon-btn" data-action="del" data-id="${item.id}">✕</button>
      </div>`;
    list.appendChild(row);
  });
  totalEl.textContent = fmt(total);
  saveCart();
}
function addToCart(id, name, price){
  const found = cart.find(i => i.id === id);
  if(found) found.qty += 1; else cart.push({id, name, price, qty:1});
  renderCart();
  openCart();
}
function openCart(){ document.querySelector('.cart-drawer')?.classList.add('open'); }
function closeCart(){ document.querySelector('.cart-drawer')?.classList.remove('open'); }

// Restore cart & render if drawer exists on page
loadCart();
renderCart();

document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-add]');
  if (addBtn) {
    const { id, name, price } = addBtn.dataset;
    addToCart(id, name, Number(price));
  }
  const actionBtn = e.target.closest('.cart-item .icon-btn');
  if (actionBtn) {
    const id = actionBtn.dataset.id;
    const action = actionBtn.dataset.action;
    const item = cart.find(i => i.id === id);
    if(!item) return;
    if(action === 'inc') item.qty += 1;
    if(action === 'dec') item.qty = Math.max(1, item.qty - 1);
    if(action === 'del') cart = cart.filter(i => i.id !== id);
    renderCart();
  }
  if (e.target.matches('#open-cart')) openCart();
  if (e.target.matches('#close-cart')) closeCart();
});

// Handle checkout (demo only)
const checkoutForm = document.querySelector('#checkout-form');
if (checkoutForm) {
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!cart.length) { alert('Your cart is empty.'); return; }
    const data = new FormData(checkoutForm);
    const order = {
      customer: { name: data.get('name'), phone: data.get('phone'), address: data.get('address') },
      items: cart,
      total: cart.reduce((s, i) => s + i.price * i.qty, 0),
      time: new Date().toLocaleString()
    };
    console.log('Order (demo):', order);
    alert('Order placed! (Demo) Check console for details.');
    cart = []; renderCart(); checkoutForm.reset(); closeCart();
  });
}

// Contact form demo
const contactForm = document.querySelector('#contact-form');
if (contactForm){
  contactForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(contactForm);
    console.log('Contact message:', Object.fromEntries(data.entries()));
    alert('Thanks! Your message has been sent (demo).');
    contactForm.reset();
  });
}
