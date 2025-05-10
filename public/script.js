let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartDisplay() {
    const cartItemCountSpan = document.querySelectorAll('#cart-item-count');
    cartItemCountSpan.forEach(span => {
        span.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    });

    const cartItemsList = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');

    if (cartItemsList && cartTotalSpan) {
        cartItemsList.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<li class="list-group-item">Your cart is empty.</li>';
            cartTotalSpan.textContent = '0.00';
        } else {
            cart.forEach(item => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.innerHTML = `
                    ${item.name} (Qty: ${item.quantity}${item.size ? ', Size: ' + item.size : ''}) - $${(item.price * item.quantity).toFixed(2)}
                    <button class="remove-cart-item btn btn-sm btn-danger" 
                            data-id="${item.id}" 
                            data-size="${item.size || ''}">
                        <i class="bi bi-trash"></i>
                    </button>
                `;
                total += item.price * item.quantity;
                cartItemsList.appendChild(listItem);
            });
            cartTotalSpan.textContent = total.toFixed(2);
        }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
}

function removeItemFromCart(productId, size = '') {
    cart = cart.filter(item => !(item.id == productId && item.size == size));
    updateCartDisplay();
    renderDrawerCart();
}

function updateItemQuantity(productId, size = '', action) {
    const item = cart.find(p => p.id == productId && p.size == size);
    if (!item) return;

    if (action === 'increase') {
        item.quantity++;
    } else if (action === 'decrease') {
        item.quantity--;
        if (item.quantity <= 0) return removeItemFromCart(productId, size);
    }

    updateCartDisplay();
    renderDrawerCart();
}

function renderDrawerCart() {
    const drawer = document.getElementById('drawer-cart-items');
    const drawerCount = document.getElementById('drawer-cart-count');
    const drawerTotal = document.getElementById('drawer-cart-total');

    if (!drawer || !drawerCount || !drawerTotal) return;

    drawer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <a href="product-detail.html?id=${item.id}">
                <img src="${item.image || 'images/default.jpg'}" alt="${item.name}">
            </a>
            <div class="cart-item-details w-100">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>${item.name}</strong><br/>
                        <small>Size: ${item.size || 'N/A'}</small>
                    </div>
                    <button class="remove-btn btn p-0 text-danger" title="Remove item"
                        data-id="${item.id}" data-size="${item.size}">
                        <i class="bi bi-trash" style="font-size: 1.3rem; color: black;"></i>
                    </button>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <div>
                        <button class="qty-btn qty-decrease" data-id="${item.id}" data-size="${item.size}" data-action="decrease">−</button>
                        <span class="mx-2">${item.quantity}</span>
                        <button class="qty-btn qty-increase" data-id="${item.id}" data-size="${item.size}" data-action="increase">+</button>
                    </div>
                    <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
            </div>
        `;
        drawer.appendChild(div);
        total += item.price * item.quantity;
    });

    drawerCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    drawerTotal.textContent = total.toFixed(2);

    setupCartDrawerEventListeners();
}


function setupCartDrawerEventListeners() {
    const drawer = document.getElementById('drawer-cart-items');
    if (!drawer) return;

    drawer.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const size = button.getAttribute('data-size');
            removeItemFromCart(id, size);
        });
    });

    drawer.querySelectorAll('.qty-btn').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            const id = button.getAttribute('data-id');
            const size = button.getAttribute('data-size');
            updateItemQuantity(id, size, action);
        });
    });
}

function addItemToCart(productId, name, price, size = '', image = '') {
    const existingItem = cart.find(item => item.id == productId && item.size == size);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id: productId, name, price, quantity: 1, size, image });
    }

    updateCartDisplay();
    renderDrawerCart();

    const drawer = document.getElementById('cart-drawer');
    if (drawer) drawer.classList.add('open');
}

function fetchProducts() {
    fetch('/api/products')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(products => {
            const productListDiv = document.getElementById('product-list');
            if (!productListDiv) return;

            productListDiv.innerHTML = '';

            products.forEach(product => {
                const {
                    _id,
                    name = 'Unnamed Product',
                    price = 0,
                    imageUrl = 'https://via.placeholder.com/200x200?text=No+Image'
                } = product;

                const productCard = document.createElement('div');
                productCard.className = 'col-6 col-md-4 col-lg-3 mb-4 product-card';

                productCard.innerHTML = `
                    <div class="card border-0 shadow-sm h-100">
                        <a href="product-detail.html?id=${_id}" class="product-image-link">
                            <img src="${imageUrl}" alt="${name}" class="product-image card-img-top"
                                 onerror="this.src='https://via.placeholder.com/200x200?text=No+Image';">
                        </a>
                        <div class="card-body text-center">
                            <h5 class="card-title mb-1">${name}</h5>
                            <p class="font-weight-bold mb-2">$${parseFloat(price).toFixed(2)}</p>
                            <button class="btn btn-sm btn-outline-dark add-to-cart-btn"
                                onclick="addItemToCart('${_id}', '${name.replace(/'/g, "\\'")}', ${price}, '', '${imageUrl}')">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                `;
                productListDiv.appendChild(productCard);
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            const productListDiv = document.getElementById('product-list');
            if (productListDiv) {
                productListDiv.innerHTML = `<div class="col-12 text-center text-danger">Failed to load products. Please try again later.</div>`;
            }
        });
}

function setupCartDrawerEvents() {
    const drawer = document.getElementById('cart-drawer');

    document.querySelectorAll('a.nav-link').forEach(link => {
        if (link.textContent.includes('Cart')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (drawer) {
                    drawer.classList.add('open');
                    renderDrawerCart();
                }
            });
        }
    });

    const closeBtn = document.querySelector('.close-cart');
    if (closeBtn && drawer) {
        closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
    }

    const continueBtn = document.querySelector('.continue-shopping');
    if (continueBtn && drawer) {
        continueBtn.addEventListener('click', () => drawer.classList.remove('open'));
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer?.classList.contains('open')) {
            drawer.classList.remove('open');
        }
    });
}

        document.addEventListener('DOMContentLoaded', () => {
            updateCartDisplay();
            renderDrawerCart();  // ✅ Fix: ensures event listeners are bound on initial load
            setupCartDrawerEvents()

    const heroBtn = document.getElementById('hero-shop-now-btn');
    if (heroBtn) {
        heroBtn.addEventListener('click', () => {
            window.location.href = 'products.html';
        });
    }

    if (document.getElementById('product-list')) {
        fetchProducts();
    }
});

const checkoutBtn = document.querySelector('#cart-drawer .btn-block.btn-dark.mb-2');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });
}


// search
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('globalSearchForm');
  const searchInput = document.getElementById('globalSearchInput');

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const query = searchInput.value.trim().toLowerCase();
      if (query) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
      }
    });
  }
});
