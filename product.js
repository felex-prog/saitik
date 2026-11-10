/* ============================================================
   FLEX MUSIC — Логика страницы товара
   ============================================================ */

'use strict';

// ============================================================
// ПОЛУЧЕНИЕ ID ИЗ URL
// ============================================================
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id'));
    return Number.isFinite(id) && id > 0 ? id : null;
}

// ============================================================
// РЕНДЕР
// ============================================================
function renderProduct(product) {
    const skeleton = document.getElementById('productSkeleton');
    const content = document.getElementById('productContent');
    const notFound = document.getElementById('productNotFound');
    const relatedSection = document.getElementById('relatedSection');
    const breadcrumbCat = document.getElementById('breadcrumbCategory');

    // Обновляем title страницы
    document.title = `${product.title} — Felex Music`;

    if (breadcrumbCat) breadcrumbCat.textContent = product.category;

    // Считаем скидку
    const discountHTML = product.oldPrice
        ? `<span class="product-info__price-discount">−${Math.round((1 - product.price / product.oldPrice) * 100)}%</span>`
        : '';

    const oldPriceHTML = product.oldPrice
        ? `<span class="product-info__price-old">${formatPrice(product.oldPrice)}</span>`
        : '';

    const badgeHTML = product.badge
        ? `<span class="product-badge ${product.badge}">${product.badgeText}</span>`
        : '';

    // Таблица характеристик
    const specsHTML = product.specs
        ? Object.entries(product.specs).map(([key, val]) => `
            <tr>
                <td>${key}</td>
                <td>${val}</td>
            </tr>
        `).join('')
        : '';

    const galleryHTML = product.image
    ? `<img
          src="${product.image}"
          alt="${product.title}"
          class="product-gallery__img"
          onerror="this.replaceWith(document.createTextNode('${product.emoji}'))"
       >`
    : product.emoji;

content.innerHTML = `
    <div class="product-gallery">
        ${badgeHTML}
        ${galleryHTML}
    </div>

        <div class="product-info">
            <div class="product-info__category">${product.category}</div>
            <h1 class="product-info__title">${product.title}</h1>
            <div class="product-info__brand">Бренд: <strong>${product.brand}</strong></div>

            <div class="product-info__price">
                <span class="product-info__price-current">${formatPrice(product.price)}</span>
                ${oldPriceHTML}
                ${discountHTML}
            </div>

            <p class="product-info__desc">${product.longDesc || product.desc}</p>

            <div class="product-info__actions">
                <button class="btn btn-primary" id="buyBtn" type="button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                        <path d="M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM20 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
                    </svg>
                    Добавить в корзину
                </button>
                <button class="btn btn-ghost" id="buyNowBtn" type="button">
                    Купить сейчас
                </button>
            </div>

            <div class="product-info__features">
                <div class="product-feature">
                    <span class="product-feature__icon">🚚</span>
                    Доставка от 1 дня
                </div>
                <div class="product-feature">
                    <span class="product-feature__icon">🛡️</span>
                    Гарантия 3 года
                </div>
                <div class="product-feature">
                    <span class="product-feature__icon">💳</span>
                    Рассрочка 0%
                </div>
            </div>
        </div>
    `;

    // Таблица характеристик
    if (specsHTML) {
        const specsBlock = document.createElement('div');
        specsBlock.className = 'product-specs';
        specsBlock.innerHTML = `
            <h2>Характеристики</h2>
            <table class="product-specs__table">
                <tbody>${specsHTML}</tbody>
            </table>
        `;
        content.appendChild(specsBlock);
    }

    // Кнопки
    document.getElementById('buyBtn').addEventListener('click', () => {
        addToCart(product.id);
    });

    document.getElementById('buyNowBtn').addEventListener('click', () => {
        addToCart(product.id);
        setTimeout(openCartModal, 200);
    });

    // Похожие товары
    const related = getProducts()  
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

    if (related.length > 0) {
        const grid = document.getElementById('relatedGrid');
        const fragment = document.createDocumentFragment();
        related.forEach((p, i) => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = productCardHTML(p, i);
            fragment.appendChild(wrapper.firstElementChild);
        });
        grid.appendChild(fragment);
        relatedSection.hidden = false;
    }

    // Показываем контент
    skeleton.hidden = true;
    content.hidden = false;
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
function initProductPage() {
    initCart();

    const id = getProductId();
    const product = id ? getProducts().find(p => p.id === id) : null;

    if (!product) {
        document.getElementById('productSkeleton').hidden = true;
        document.getElementById('productNotFound').hidden = false;
        return;
    }

    renderProduct(product);
}

document.addEventListener('DOMContentLoaded', initProductPage);