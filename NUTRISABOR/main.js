function toggleMenu() {
  const menu = document.getElementById('menu');
  const overlay = document.getElementById('menu-overlay');
  const isActive = menu.classList.contains('active');
  
  if (isActive) {
    closeMenu();
  } else {
    openMenu();
  }
}

function openMenu() {
  const menu = document.getElementById('menu');
  const overlay = document.getElementById('menu-overlay');
  menu.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
}

function closeMenu() {
  const menu = document.getElementById('menu');
  const overlay = document.getElementById('menu-overlay');
  menu.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
}

// Cerrar menú al hacer click en un link
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => {
    closeMenu();
  });       
});

// Cerrar menú al hacer click fuera
document.addEventListener('click', (e) => {
  const menu = document.getElementById('menu');
  const toggle = document.querySelector('.menu-toggle');
  const overlay = document.getElementById('menu-overlay');
  
  if (!menu.contains(e.target) && !toggle.contains(e.target) && overlay.contains(e.target)) {
    closeMenu();
  }
});

// Modern Effects: Scroll-triggered animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = '0s';
      entry.target.style.animationPlayState = 'running';
    }
  });
}, observerOptions);

// Observe cards for scroll animations
document.querySelectorAll('.card').forEach((card, index) => {
  card.style.animationDelay = `${index * 0.1}s`;
  card.style.animationPlayState = 'paused';
  observer.observe(card);
});

// Parallax effect for header
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  const scrolled = window.scrollY;
  const rate = scrolled * -0.5;

  header.style.transform = `translateY(${rate}px)`;
  lastScrollY = scrolled;
});

// Smooth scroll for navigation links
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add loading animation to buttons
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function() {
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
      this.style.transform = '';
    }, 150);
  });
});

// Card hover sound effect (visual feedback)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-8px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// Typing effect for welcome message
function typeWriter(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

// Apply typing effect to welcome message
document.addEventListener('DOMContentLoaded', () => {
  const welcomeText = document.querySelector('.card-content h2');
  if (welcomeText) {
    const originalText = welcomeText.textContent;
    setTimeout(() => {
      typeWriter(welcomeText, originalText, 80);
    }, 500);
  }
});

let total = 0;
let cart = [];
let currentUser = null;
let users = [];
let orders = [];

const STORAGE_KEYS = {
  users: 'nutrisabor_users',
  orders: 'nutrisabor_orders',
  session: 'nutrisabor_session'
};

function initializeData() {
  users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
  orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || '[]');

  if (!users.find(u => u.role === 'admin')) {
    users.push({
      id: crypto.randomUUID(),
      name: 'Administrador',
      email: 'admin@nutrisabor.com',
      password: 'admin',
      role: 'admin'
    });
  }

  const savedSession = JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || 'null');
  if (savedSession) {
    currentUser = users.find(u => u.id === savedSession.id) || null;
  }

  if (window.location.pathname.endsWith('login.html') && currentUser) {
    window.location.href = './index.html';
    return;
  }

  saveUsers();
  saveOrders();

  setCurrentUserUI();
  renderUserList();
  renderOrderLists();
  renderMyOrders();
}

function saveUsers() {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function saveOrders() {
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
}

function saveSession() {
  if (currentUser) {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ id: currentUser.id }));
  } else {
    localStorage.removeItem(STORAGE_KEYS.session);
  }
}

function createUser() {
  const name = document.getElementById('new-name').value.trim();
  const email = document.getElementById('new-email').value.trim().toLowerCase();
  const password = document.getElementById('new-password').value;
  const role = document.getElementById('new-role').value;

  if (!name || !email || !password) {
    alert('Completa todos los campos al crear usuario');
    return;
  }

  if (users.some(u => u.email === email)) {
    alert('Ya existe un usuario con ese email');
    return;
  }

  if (role === 'admin' && users.some(u => u.role === 'admin')) {
    alert('Ya existe un administrador. Solo puede haber uno.');
    return;
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
    role
  };

  users.push(user);
  saveUsers();
  renderUserList();
  alert('Usuario creado con éxito');
  document.getElementById('new-name').value = '';
  document.getElementById('new-email').value = '';
  document.getElementById('new-password').value = '';
}

function login() {
  const emailField = document.getElementById('login-email');
  const passField = document.getElementById('login-password');

  const email = emailField ? emailField.value.trim().toLowerCase() : '';
  const password = passField ? passField.value : '';

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert('Credenciales inválidas');
    return;
  }

  currentUser = user;
  saveSession();

  if (window.location.pathname.endsWith('login.html')) {
    window.location.href = './index.html';
    return;
  }

  setCurrentUserUI();
  renderUserList();
  renderOrderLists();
  renderMyOrders();
  alert(`Bienvenido ${user.name} (${user.role})`);
}

function loginFromPage() {
  const email = document.getElementById('page-login-email').value.trim().toLowerCase();
  const password = document.getElementById('page-login-password').value;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert('Credenciales inválidas');
    return;
  }

  currentUser = user;
  saveSession();
  window.location.href = './index.html';
}

function logout() {
  currentUser = null;
  cart = [];
  total = 0;
  saveSession();
  setCurrentUserUI();
  renderFolder();
  document.getElementById('cart-items').innerHTML = '';
  document.getElementById('total').textContent = '0';
  document.getElementById('cart-message').textContent = '';
}

function setCurrentUserUI() {
  const currentUserText = document.getElementById('current-user');
  const logoutBtn = document.getElementById('logout-button');

  if (currentUser) {
    currentUserText.textContent = `Conectado como: ${currentUser.name} (${currentUser.role})`;
    logoutBtn.style.display = 'inline-block';
    document.getElementById('place-order-button').disabled = false;
  } else {
    currentUserText.textContent = 'No hay sesión activa';
    logoutBtn.style.display = 'none';
    document.getElementById('place-order-button').disabled = true;
  }
  renderFolder();
}

function renderFolder() {
  const adminSection = document.getElementById('admin-section');
  const adminOrdersSection = document.getElementById('admin-orders-section');
  const userOrdersSection = document.getElementById('user-orders-section');

  if (!currentUser) {
    adminSection.style.display = 'none';
    adminOrdersSection.style.display = 'none';
    userOrdersSection.style.display = 'none';
    return;
  }

  if (currentUser.role === 'admin') {
    adminSection.style.display = 'block';
    adminOrdersSection.style.display = 'block';
    userOrdersSection.style.display = 'none';
  } else {
    adminSection.style.display = 'none';
    adminOrdersSection.style.display = 'none';
    userOrdersSection.style.display = 'block';
  }
}

function renderUserList() {
  const list = document.getElementById('user-list');
  list.innerHTML = '';

  if (!currentUser || currentUser.role !== 'admin') return;

  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = `${user.name} (${user.email}) - ${user.role}`;
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn';
    deleteBtn.textContent = 'Borrar';
    deleteBtn.style.marginLeft = '8px';
    deleteBtn.onclick = () => {
      if (user.id === currentUser.id) {
        alert('No puedes eliminarte a ti mismo');
        return;
      }
      users = users.filter(u => u.id !== user.id);
      saveUsers();
      renderUserList();
    };

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

function renderOrderLists() {
  renderAdminOrders();
  renderMyOrders();
}

function renderAdminOrders() {
  const list = document.getElementById('orders-list');
  list.innerHTML = '';

  if (!currentUser || currentUser.role !== 'admin') return;

  if (orders.length === 0) {
    list.innerHTML = '<li>No hay pedidos aún</li>';
    return;
  }

  orders.forEach(order => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${order.userName}</strong> - $${order.total} - ${order.status} - ${new Date(order.createdAt).toLocaleString()} `;
    const statusSelect = document.createElement('select');
    ['Pendiente', 'En preparación', 'Listo', 'Entregado'].forEach(status => {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status;
      option.selected = order.status === status;
      statusSelect.appendChild(option);
    });
    statusSelect.onchange = () => updateOrderStatus(order.id, statusSelect.value);
    li.appendChild(statusSelect);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.style.marginLeft = '8px';
    deleteBtn.onclick = () => {
      orders = orders.filter(o => o.id !== order.id);
      saveOrders();
      renderOrderLists();
    };
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

function renderMyOrders() {
  const list = document.getElementById('my-orders');
  list.innerHTML = '';

  if (!currentUser) return;

  const myOrders = orders.filter(order => order.userId === currentUser.id);
  if (myOrders.length === 0) {
    list.innerHTML = '<li>No tenés pedidos todavía</li>';
    return;
  }

  myOrders.forEach(order => {
    const li = document.createElement('li');
    const itemsText = order.items.map(item => `${item.product} x${item.quantity}`).join(', ');
    li.textContent = `${new Date(order.createdAt).toLocaleString()} - ${itemsText} - $${order.total} - ${order.status}`;
    list.appendChild(li);
  });
}

function updateOrderStatus(orderId, status) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.status = status;
  saveOrders();
  renderOrderLists();
  renderMyOrders();
}

function addToCart(product, price) {
  cart.push({ product, price, quantity: 1 });
  const cartItems = document.getElementById('cart-items');
  const li = document.createElement('li');
  li.textContent = `${product} - $${price}`;
  cartItems.appendChild(li);

  total += price;
  document.getElementById('total').textContent = total;
  document.getElementById('cart-message').textContent = 'Recordá iniciar sesión antes de confirmar pedido';
}

function placeOrder() {
  if (!currentUser) {
    alert('Iniciá sesión primero');
    return;
  }

  if (cart.length === 0) {
    alert('El carrito está vacío');
    return;
  }

  const order = {
    id: crypto.randomUUID(),
    userId: currentUser.id,
    userName: currentUser.name,
    items: cart.map(i => ({ ...i })),
    total,
    status: 'Pendiente',
    createdAt: Date.now()
  };

  orders.push(order);
  saveOrders();

  cart = [];
  total = 0;
  document.getElementById('cart-items').innerHTML = '';
  document.getElementById('total').textContent = '0';
  document.getElementById('cart-message').textContent = 'Pedido enviado';

  renderOrderLists();
  alert('Pedido confirmado');
}

initializeData();

// Function for login page tabs
function switchTab(tabName) {
  // Remove active class from all tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Hide all form sections
  document.querySelectorAll('.form-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Add active class to clicked tab
  event.target.classList.add('active');
  
  // Show corresponding form section
  document.getElementById(tabName + '-form').classList.add('active');
}
  