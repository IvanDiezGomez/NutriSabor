 function toggleMenu() {
      document.getElementById('menu').classList.toggle('active');
    }

    let total = 0;

    function addToCart(product, price) {
      const cartItems = document.getElementById('cart-items');
      const li = document.createElement('li');
      li.textContent = product + ' - $' + price;
      cartItems.appendChild(li);

      total += price;
      document.getElementById('total').textContent = total;
    }
  