/* ============================================================
   FLEX MUSIC — Логика корзины (модальное окно + состояние)
   ============================================================ */

'use strict';

// ============================================================
// ХРАНИЛИЩЕ
// ============================================================
const CART_STORAGE_KEY = 'felex_cart';

let cart = loadCart();

function loadCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.warn('Не удалось загрузить корзину:', err);
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
        console.warn('Не удалось сохранить корзину:', err);
    }
}

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ============================================================
// ОПЕРАЦИИ
// ============================================================
function addToCart(productId) {
   const product = getProducts().find(p => p.id === productId);

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
    id: product.id,
    title: product.title,
    price: product.price,
    emoji: product.emoji,
    image: product.image,   // ← НОВОЕ
    qty: 1
});
    }

    saveCart();
    updateCartUI(true);
    renderCartItems();
    showToast(`🐱 "${product.title}" добавлен в корзину`);
}

function changeQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
    updateCartUI();
    renderCartItems();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    updateCartUI();
    renderCartItems();
    showToast('🗑️ Товар удалён из корзины');
}

function clearCart() {
    if (cart.length === 0) return;
    if (!confirm('Очистить всю корзину?')) return;

    cart = [];
    saveCart();
    updateCartUI();
    renderCartItems();
    showToast('🧹 Корзина очищена');
}

// ============================================================
// UI КОРЗИНЫ В ШАПКЕ
// ============================================================
function updateCartUI(animate = false) {
    const counter = document.getElementById('cartCount');
    if (!counter) return;

    counter.textContent = getCartCount();

    if (animate) {
        counter.style.transform = 'scale(1.3)';
        setTimeout(() => counter.style.transform = 'scale(1)', 200);
    }
}

// ============================================================
// МОДАЛЬНОЕ ОКНО
// ============================================================
function openCartModal() {
    const modal = document.getElementById('cartModal');
    if (!modal) return;

    renderCartItems();
    modal.hidden = false;
    // форсируем reflow для анимации
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (!modal) return;

    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 300);
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const footer = document.querySelector('.cart-modal__footer');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty__icon">🐱</div>
                <h3>Корзина пуста</h3>
                <p>Кот-консультант ждёт, когда вы что-нибудь выберете</p>
                <a href="catalog.html" class="btn btn-primary" data-close>Перейти в каталог</a>
            </div>
        `;
        if (footer) footer.style.display = 'none';
        return;
    }

    if (footer) footer.style.display = '';

    container.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item__media">
    ${item.image
        ? `<img src="${item.image}" alt="${item.title}" onerror="this.replaceWith(document.createTextNode('${item.emoji}'))">`
        : item.emoji}
</div>
            <div class="cart-item__info">
                <a href="product.html?id=${item.id}" class="cart-item__title">${item.title}</a>
                <div class="cart-item__price">${formatPrice(item.price)}</div>
            </div>
            <div class="cart-item__controls">
                <button class="cart-qty-btn" data-action="dec" data-id="${item.id}" aria-label="Уменьшить">−</button>
                <span class="cart-qty-value">${item.qty}</span>
                <button class="cart-qty-btn" data-action="inc" data-id="${item.id}" aria-label="Увеличить">+</button>
            </div>
            <button class="cart-item__remove" data-action="remove" data-id="${item.id}" aria-label="Удалить">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `).join('');

    if (totalEl) totalEl.textContent = formatPrice(getCartTotal());
}

// ============================================================
// TOAST
// ============================================================
let toastTimer = null;

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ============================================================
// ГЛОБАЛЬНЫЕ ОБРАБОТЧИКИ (работают на всех страницах)
// ============================================================
function initCartGlobal() {
    // Клик по кнопке корзины в шапке
    document.addEventListener('click', (e) => {
        // Кнопка "Корзина" в шапке
        if (e.target.closest('#cartBtn')) {
            openCartModal();
            return;
        }

        // "В корзину" на карточке товара
        const addBtn = e.target.closest('.add-btn');
        if (addBtn) {
            e.preventDefault();
            e.stopPropagation();
            addToCart(Number(addBtn.dataset.id));
            return;
        }

        // Клик по самой карточке → переход на страницу товара
        const card = e.target.closest('.product-card');
        if (card && card.dataset.href && !e.target.closest('a')) {
            window.location.href = card.dataset.href;
            return;
        }
    });

    // Закрытие модалки
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.dataset.close !== undefined || e.target.closest('[data-close]')) {
                closeCartModal();
                return;
            }

            // Кнопки +/- и удалить
            const btn = e.target.closest('[data-action]');
            if (btn) {
                const id = Number(btn.dataset.id);
                const action = btn.dataset.action;
                if (action === 'inc') changeQty(id, 1);
                if (action === 'dec') changeQty(id, -1);
                if (action === 'remove') removeFromCart(id);
            }
        });

        // Очистить корзину
        modal.querySelector('#clearCartBtn')?.addEventListener('click', clearCart);

        // Оформить заказ
        modal.querySelector('#checkoutBtn')?.addEventListener('click', () => {
            showToast('🐱 Заказ оформлен! Мы свяжемся с вами');
            setTimeout(() => {
                cart = [];
                saveCart();
                updateCartUI();
                closeCartModal();
            }, 1500);
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.hidden) closeCartModal();
        });
    }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ (вызывается после DOMContentLoaded)
// ============================================================
function initCart() {
    updateCartUI(false);
    initCartGlobal();
}