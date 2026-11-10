/* ============================================================
   FLEX MUSIC — Логика каталога
   ============================================================ */

'use strict';

const state = {
    search: '',
    category: '',
    priceMin: null,
    priceMax: null,
    sort: 'default'
};

function renderCategoryFilter() {
    const container = document.getElementById('categoryOptions');
    if (!container) return;

    const categories = [...new Set(getProducts().map(p => p.category))].sort();

    categories.forEach(cat => {
        const label = document.createElement('label');
        label.className = 'filter-radio';
        label.innerHTML = `
            <input type="radio" name="category" value="${cat}">
            <span>${cat}</span>
        `;
        container.appendChild(label);
    });
}

function applyFilters() {
    let result = [...getProducts()];

    if (state.search.trim()) {
        const q = state.search.trim().toLowerCase();
        result = result.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q)
        );
    }

    if (state.category) result = result.filter(p => p.category === state.category);
    if (state.priceMin !== null) result = result.filter(p => p.price >= state.priceMin);
    if (state.priceMax !== null) result = result.filter(p => p.price <= state.priceMax);

    switch (state.sort) {
        case 'price-asc':  result.sort((a, b) => a.price - b.price); break;
        case 'price-desc': result.sort((a, b) => b.price - a.price); break;
        case 'name-asc':   result.sort((a, b) => a.title.localeCompare(b.title, 'ru')); break;
        case 'name-desc':  result.sort((a, b) => b.title.localeCompare(a.title, 'ru')); break;
    }

    renderCatalog(result);
}

function renderCatalog(items) {
    const grid = document.getElementById('catalogGrid');
    const empty = document.getElementById('catalogEmpty');
    const count = document.getElementById('resultsCount');
    if (!grid) return;

    grid.innerHTML = '';
    count.textContent = items.length;

    if (items.length === 0) {
        grid.hidden = true;
        empty.hidden = false;
        return;
    }

    grid.hidden = false;
    empty.hidden = true;

    const fragment = document.createDocumentFragment();
    items.forEach((p, index) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = productCardHTML(p, index);
        fragment.appendChild(wrapper.firstElementChild);
    });

    grid.appendChild(fragment);
}

function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (!cat) return;

    const radio = document.querySelector(`input[name="category"][value="${CSS.escape(cat)}"]`);
    if (radio) {
        radio.checked = true;
        state.category = cat;
    }
}

function bindEvents() {
    const searchInput = document.getElementById('searchInput');
    let searchTimer;
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            state.search = e.target.value;
            applyFilters();
        }, 250);
    });

    document.getElementById('categoryOptions')?.addEventListener('change', (e) => {
        if (e.target.name === 'category') {
            state.category = e.target.value;
            applyFilters();
        }
    });

    document.getElementById('priceMin')?.addEventListener('input', (e) => {
        const v = e.target.value.trim();
        state.priceMin = v === '' ? null : Math.max(0, Number(v));
        applyFilters();
    });

    document.getElementById('priceMax')?.addEventListener('input', (e) => {
        const v = e.target.value.trim();
        state.priceMax = v === '' ? null : Math.max(0, Number(v));
        applyFilters();
    });

    document.getElementById('sortSelect')?.addEventListener('change', (e) => {
        state.sort = e.target.value;
        applyFilters();
    });

    document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
    document.getElementById('emptyResetBtn')?.addEventListener('click', resetFilters);
}

function resetFilters() {
    state.search = '';
    state.category = '';
    state.priceMin = null;
    state.priceMax = null;
    state.sort = 'default';

    const searchInput = document.getElementById('searchInput');
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const sortSelect = document.getElementById('sortSelect');
    const allCat = document.querySelector('input[name="category"][value=""]');

    if (searchInput) searchInput.value = '';
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';
    if (sortSelect) sortSelect.value = 'default';
    if (allCat) allCat.checked = true;

    window.history.replaceState({}, '', window.location.pathname);
    applyFilters();
}

function init() {
    renderCategoryFilter();
    applyUrlParams();
    applyFilters();
    initCart();        // корзина из cart.js
    bindEvents();
}

document.addEventListener('DOMContentLoaded', init);