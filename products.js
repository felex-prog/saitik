/* ============================================================
   FLEX MUSIC — Данные товаров (localStorage) + утилиты
   ============================================================ */

'use strict';

const PRODUCTS_STORAGE_KEY = 'felex_products';

// Исходные данные (используются при первом запуске или сбросе)
const DEFAULT_PRODUCTS = [
    {
        id: 1, title: 'Fender Player Stratocaster', category: 'Гитары', brand: 'Fender',
        price: 89990, oldPrice: 104990, emoji: '🎸', badge: 'hit', badgeText: 'Хит',
        desc: 'Легендарная электрогитара с классическим звуком',
        longDesc: 'Fender Player Stratocaster — современная версия легендарной гитары...',
        bestseller: true,
        specs: { 'Корпус': 'Ольха', 'Гриф': 'Клён, Modern "C"', 'Звукосниматели': '3 × Single-Coil', 'Мензура': '648 мм' }
    },
    {
        id: 2, title: 'Yamaha P-125 Digital Piano', category: 'Клавишные', brand: 'Yamaha',
        price: 74900, emoji: '🎹', badge: 'new', badgeText: 'Новинка',
        desc: '88 взвешенных клавиш, идеален для дома и студии',
        longDesc: 'Yamaha P-125 — компактное цифровое пианино...',
        bestseller: true,
        specs: { 'Клавиатура': '88 клавиш, GHS', 'Полифония': '192 голоса', 'Вес': '11,8 кг' }
    },
    {
        id: 3, title: 'Rode NT1-A Condenser', category: 'Микрофоны', brand: 'Rode',
        price: 28990, oldPrice: 32990, emoji: '🎤',
        desc: 'Профессиональный конденсаторный микрофон',
        longDesc: 'Rode NT1-A — один из самых тихих конденсаторных микрофонов...',
        bestseller: true,
        specs: { 'Тип': 'Конденсаторный', 'Диаграмма': 'Кардиоида', 'Собственный шум': '5 дБА' }
    },
    {
        id: 4, title: 'Roland TD-17KVX Drums', category: 'Ударные', brand: 'Roland',
        price: 132990, emoji: '🥁', badge: 'hit', badgeText: 'Хит',
        desc: 'Электронная установка с реалистичной отдачей',
        longDesc: 'Roland TD-17KVX — флагманская электронная установка...',
        bestseller: true,
        specs: { 'Пэды': 'Сетчатые, двойная зона', 'Модуль': 'TD-17', 'Китов': '50' }
    },
    {
        id: 5, title: 'Audio-Technica ATH-M50x', category: 'Наушники', brand: 'Audio-Technica',
        price: 19990, emoji: '🎧', desc: 'Мониторные наушники для сведения',
        longDesc: 'Audio-Technica ATH-M50x — эталонные мониторные наушники...',
        bestseller: false,
        specs: { 'Тип': 'Закрытые', 'Драйверы': '45 мм', 'Импеданс': '38 Ом' }
    },
    {
        id: 6, title: 'Korg Minilogue XD', category: 'Клавишные', brand: 'Korg',
        price: 89490, emoji: '🎹', badge: 'new', badgeText: 'Новинка',
        desc: 'Полифонический аналоговый синтезатор',
        longDesc: 'Korg Minilogue XD — 4-голосный аналоговый синтезатор...',
        bestseller: false,
        specs: { 'Полифония': '4 голоса', 'Осцилляторы': '2 × VCO + Multi-Engine' }
    },
    {
        id: 7, title: 'Focusrite Scarlett 2i2', category: 'Студийное', brand: 'Focusrite',
        price: 24990, oldPrice: 28990, emoji: '🎛️',
        desc: 'USB-аудиоинтерфейс, стандарт домашних студий',
        longDesc: 'Focusrite Scarlett 2i2 4-го поколения — самый популярный USB-аудиоинтерфейс...',
        bestseller: false,
        specs: { 'Входы': '2 × XLR/TRS', 'Разрешение': '24 бит / 192 кГц' }
    },
    {
        id: 8, title: 'Ibanez GSR200 Bass', category: 'Гитары', brand: 'Ibanez',
        price: 34990, emoji: '🎸', desc: 'Бас-гитара для начинающих и профи',
        longDesc: 'Ibanez GSR200 — надёжная и удобная бас-гитара...',
        bestseller: false,
        specs: { 'Корпус': 'Махагони', 'Мензура': '864 мм' }
    },
    {
        id: 9, title: 'Shure SM58 Dynamic', category: 'Микрофоны', brand: 'Shure',
        price: 14990, emoji: '🎤', badge: 'hit', badgeText: 'Хит',
        desc: 'Легендарный вокальный микрофон для сцены',
        longDesc: 'Shure SM58 — самый узнаваемый вокальный микрофон в мире...',
        bestseller: false,
        specs: { 'Тип': 'Динамический', 'Диаграмма': 'Кардиоида' }
    },
    {
        id: 10, title: 'Gibson Les Paul Standard', category: 'Гитары', brand: 'Gibson',
        price: 289990, emoji: '🎸', desc: 'Электрогитара мечты, классика рок-музыки',
        longDesc: 'Gibson Les Paul Standard 60s — та самая легенда...',
        bestseller: false,
        specs: { 'Корпус': 'Махагони + клён', 'Звукосниматели': '2 × Burstbucker 61' }
    },
    {
        id: 11, title: 'Alesis Nitro Mesh Kit', category: 'Ударные', brand: 'Alesis',
        price: 42990, oldPrice: 48990, emoji: '🥁',
        desc: 'Электронная барабанная установка для дома',
        longDesc: 'Alesis Nitro Mesh — бюджетная электронная установка...',
        bestseller: false,
        specs: { 'Пэды': 'Сетчатые', 'Китов': '40' }
    },
    {
        id: 12, title: 'Behringer UMC202HD', category: 'Студийное', brand: 'Behringer',
        price: 13990, emoji: '🎛️', desc: 'Бюджетный аудиоинтерфейс с MIDAS-преампами',
        longDesc: 'Behringer UMC202HD — доступный аудиоинтерфейс...',
        bestseller: false,
        specs: { 'Входы': '2 × XLR/TRS', 'Преампы': '2 × MIDAS' }
    },
    {
        id: 13, title: 'Beyerdynamic DT 990 Pro', category: 'Наушники', brand: 'Beyerdynamic',
        price: 17990, emoji: '🎧', badge: 'new', badgeText: 'Новинка',
        desc: 'Открытые студийные наушники 250 Ом',
        longDesc: 'Beyerdynamic DT 990 Pro — легендарные открытые наушники...',
        bestseller: false,
        specs: { 'Тип': 'Открытые', 'Импеданс': '250 Ом' }
    },
    {
        id: 14, title: 'Casio CT-S300', category: 'Клавишные', brand: 'Casio',
        price: 13990, emoji: '🎹', desc: 'Компактный синтезатор для начинающих',
        longDesc: 'Casio CT-S300 — легкий 61-клавишный синтезатор...',
        bestseller: false,
        specs: { 'Клавиатура': '61 клавиша', 'Тембры': '400' }
    },
    {
        id: 15, title: 'Marshall DSL40CR Combo', category: 'Студийное', brand: 'Marshall',
        price: 74990, emoji: '🔊', desc: 'Ламповый гитарный комбоусилитель 40 Вт',
        longDesc: 'Marshall DSL40CR — 40-ваттный ламповый комбо...',
        bestseller: false,
        specs: { 'Мощность': '40 Вт', 'Лампы': 'ECC83 × 3, EL34 × 2' }
    },
    {
        id: 16, title: 'Sennheiser e935', category: 'Микрофоны', brand: 'Sennheiser',
        price: 26990, emoji: '🎤', desc: 'Динамический вокальный микрофон премиум-класса',
        longDesc: 'Sennheiser e935 — профессиональный вокальный микрофон...',
        bestseller: false,
        specs: { 'Тип': 'Динамический', 'Диаграмма': 'Кардиоида' }
    }
];

// ============================================================
// CRUD для товаров
// ============================================================
function initProductsStorage() {
    if (!localStorage.getItem(PRODUCTS_STORAGE_KEY)) {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    }
}

function getProducts() {
    try {
        const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (!raw) {
            initProductsStorage();
            return [...DEFAULT_PRODUCTS];
        }
        return JSON.parse(raw);
    } catch (err) {
        console.error('Ошибка чтения товаров:', err);
        return [...DEFAULT_PRODUCTS];
    }
}

function saveProducts(list) {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
}

function resetProductsToDefault() {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return [...DEFAULT_PRODUCTS];
}

function nextProductId() {
    const list = getProducts();
    return list.length ? Math.max(...list.map(p => p.id)) + 1 : 1;
}

// ============================================================
// УТИЛИТЫ
// ============================================================
function formatPrice(value) {
    return value.toLocaleString('ru-RU') + ' ₽';
}

// ============================================================
// ХЕЛПЕР: HTML карточки товара
// ============================================================
function productCardHTML(p, index = 0) {
    const badgeHTML = p.badge
        ? `<span class="product-badge ${p.badge}">${p.badgeText}</span>`
        : '';

    const oldPriceHTML = p.oldPrice
        ? `<small>${formatPrice(p.oldPrice)}</small>`
        : '';

    const mediaHTML = p.image
        ? `<img src="${p.image}" alt="${p.title}" loading="lazy" class="product-image__img" onerror="this.replaceWith(document.createTextNode('${p.emoji}'))">`
        : p.emoji;

    return `
        <article class="product-card" data-id="${p.id}" data-href="product.html?id=${p.id}" style="animation-delay:${index * 0.05}s">
            <div class="product-image">
                ${badgeHTML}
                ${mediaHTML}
            </div>
            <div class="product-body">
                <div class="product-category">${p.category}</div>
                <h3 class="product-title">${p.title}</h3>
                <p class="product-desc">${p.desc}</p>
                <div class="product-footer">
                    <div class="product-price">
                        ${formatPrice(p.price)}
                        ${oldPriceHTML}
                    </div>
                    <button class="add-btn" data-id="${p.id}" type="button" aria-label="Добавить в корзину">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                    </button>
                </div>
            </div>
        </article>
    `;
}

// Инициализация при загрузке
initProductsStorage();