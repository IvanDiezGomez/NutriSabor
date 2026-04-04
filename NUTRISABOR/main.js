function toggleMenu() {
  const menu = document.getElementById('menu');
  menu.classList.toggle('active');
}

// Cerrar menú al hacer click en un link
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('menu').classList.remove('active');
  });       
});

// Cerrar menú al hacer click fuera
document.addEventListener('click', (e) => {
  const menu = document.getElementById('menu');
  const toggle = document.querySelector('.menu-toggle');
  if (!menu.contains(e.target) && !toggle.contains(e.target)) {
    menu.classList.remove('active');
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
  