/* ============================================================
   FLEX MUSIC — Логика админ-панели
   ============================================================ */

'use strict';

let editingProductId = null;

// ============================================================
// ТАБЫ
// ============================================================
function initAdminTabs() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab + 'Panel').classList.add('active');
        });
    });
}

// ============================================================
// СТАТИСТИКА
// ============================================================
function renderStats() {
    const products = getProducts();
    const users = getUsers();
    document.getElementById('statProducts').textContent = products.length;
    document.getElementById('statUsers').textContent = users.length;
    document.getElementById('statBestsellers').textContent = products.filter(p => p.bestseller).length;
    document.getElementById('statAdmins').textContent = users.filter(u => u.role === 'admin').length;
}

// ============================================================
// ТАБЛИЦА ТОВАРОВ
// ============================================================
function renderProductsTable(filter = '') {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    const q = filter.trim().toLowerCase();
    const products = getProducts().filter(p =>
        !q || p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);padding:40px;">Товаров не найдено</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td><div class="admin-table__emoji">${p.emoji || '📦'}</div></td>
            <td><strong>${p.title}</strong><br><small style="color:var(--text-secondary);">${p.brand}</small></td>
            <td>${p.category}</td>
            <td class="admin-table__price">${formatPrice(p.price)}</td>
            <td>${p.bestseller ? '<span class="admin-table__check">✓ Да</span>' : '—'}</td>
            <td>
                <button class="admin-action" data-action="edit" data-id="${p.id}" title="Редактировать">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="admin-action danger" data-action="delete" data-id="${p.id}" title="Удалить">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');
}

// ============================================================
// ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
// ============================================================
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    const currentUser = getCurrentUser();
    const users = getUsers();

    tbody.innerHTML = users.map(u => {
        const isSelf = currentUser && u.id === currentUser.id;
        const date = new Date(u.createdAt).toLocaleDateString('ru-RU');
        const roleBadge = u.role === 'admin'
            ? '<span class="admin-table__badge admin">👑 Админ</span>'
            : '<span class="admin-table__badge user">Покупатель</span>';

        return `
            <tr>
                <td>${u.id}</td>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td>${roleBadge}</td>
                <td>${date}</td>
                <td>
                    ${!isSelf ? `
                        <button class="admin-action" data-action="toggle-role" data-id="${u.id}" title="${u.role === 'admin' ? 'Сделать покупателем' : 'Сделать админом'}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </button>
                        <button class="admin-action danger" data-action="delete-user" data-id="${u.id}" title="Удалить">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            </svg>
                        </button>
                    ` : '<em style="color:var(--text-secondary);font-size:0.85rem;">это вы</em>'}
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================================
// МОДАЛКА ТОВАРА
// ============================================================
function openProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('productModalTitle');

    form.reset();
    editingProductId = product?.id ?? null;
    title.textContent = product ? 'Редактировать товар' : 'Добавить товар';

    if (product) {
        form.title.value = product.title;
        form.brand.value = product.brand;
        form.category.value = product.category;
        form.emoji.value = product.emoji || '';
        form.price.value = product.price;
        form.oldPrice.value = product.oldPrice || '';
        form.image.value = product.image || '';
        form.desc.value = product.desc;
        form.longDesc.value = product.longDesc || '';
        form.badge.value = product.badge || '';
        form.bestseller.checked = !!product.bestseller;
    }

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => form.title.focus(), 100);
}

function closeProductModal() {
    document.getElementById('productModal').hidden = true;
    document.body.style.overflow = '';
    editingProductId = null;
}

function saveProduct(e) {
    e.preventDefault();
    const form = e.target;
    const products = getProducts();

    const productData = {
        title: form.title.value.trim(),
        brand: form.brand.value.trim(),
        category: form.category.value,
        emoji: form.emoji.value.trim() || '📦',
        price: Number(form.price.value),
        oldPrice: form.oldPrice.value ? Number(form.oldPrice.value) : undefined,
        image: form.image.value.trim() || undefined,
        desc: form.desc.value.trim(),
        longDesc: form.longDesc.value.trim() || undefined,
        badge: form.badge.value || undefined,
        badgeText: form.badge.value === 'hit' ? 'Хит' : form.badge.value === 'new' ? 'Новинка' : undefined,
        bestseller: form.bestseller.checked
    };

    if (!productData.title || !productData.brand || !productData.category || !productData.desc || productData.price <= 0) {
        showToast('⚠️ Заполните все обязательные поля');
        return;
    }

    if (editingProductId) {
        const idx = products.findIndex(p => p.id === editingProductId);
        if (idx !== -1) {
            products[idx] = { ...products[idx], ...productData };
        }
        showToast('✅ Товар обновлён');
    } else {
        products.push({ id: nextProductId(), ...productData });
        showToast('✅ Товар добавлен');
    }

    saveProducts(products);
    closeProductModal();
    renderProductsTable(document.getElementById('adminSearch').value);
    renderStats();
}

// ============================================================
// УДАЛЕНИЕ
// ============================================================
function deleteProduct(id) {
    const product = getProducts().find(p => p.id === id);
    if (!product) return;

    if (!confirm(`Удалить товар "${product.title}"?`)) return;

    const products = getProducts().filter(p => p.id !== id);
    saveProducts(products);
    renderProductsTable(document.getElementById('adminSearch').value);
    renderStats();
    showToast('🗑️ Товар удалён');
}

function deleteUser(id) {
    const users = getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return;

    if (!confirm(`Удалить пользователя "${user.name}" (${user.email})?`)) return;

    saveUsers(users.filter(u => u.id !== id));
    renderUsersTable();
    renderStats();
    showToast('🗑️ Пользователь удалён');
}

function toggleUserRole(id) {
    const users = getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return;

    user.role = user.role === 'admin' ? 'user' : 'admin';
    saveUsers(users);
    renderUsersTable();
    renderStats();
    showToast(`✅ ${user.name} теперь ${user.role === 'admin' ? 'администратор' : 'покупатель'}`);
}

// ============================================================
// ОБРАБОТЧИКИ
// ============================================================
function bindAdminEvents() {
    // Поиск по товарам
    document.getElementById('adminSearch')?.addEventListener('input', (e) => {
        renderProductsTable(e.target.value);
    });

    // Добавить товар
    document.getElementById('addProductBtn')?.addEventListener('click', () => openProductModal());

    // Клики в таблице товаров
    document.getElementById('productsTableBody')?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const id = Number(btn.dataset.id);
        if (btn.dataset.action === 'edit') {
            const product = getProducts().find(p => p.id === id);
            if (product) openProductModal(product);
        }
        if (btn.dataset.action === 'delete') deleteProduct(id);
    });

    // Клики в таблице пользователей
    document.getElementById('usersTableBody')?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const id = Number(btn.dataset.id);
        if (btn.dataset.action === 'toggle-role') toggleUserRole(id);
        if (btn.dataset.action === 'delete-user') deleteUser(id);
    });

    // Форма товара
    document.getElementById('productForm')?.addEventListener('submit', saveProduct);

    // Закрытие модалки
    const modal = document.getElementById('productModal');
    modal?.addEventListener('click', (e) => {
        if (e.target.dataset.close !== undefined || e.target.closest('[data-close]')) {
            closeProductModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) closeProductModal();
    });

    // Сброс товаров
    document.getElementById('resetProductsBtn')?.addEventListener('click', () => {
        if (!confirm('Сбросить все товары к исходным? Все изменения будут потеряны.')) return;
        resetProductsToDefault();
        renderProductsTable();
        renderStats();
        showToast('🔄 Товары сброшены к исходным');
    });
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
function initAdmin() {
    // ⚠️ ЗАЩИТА: пускаем только админов
    if (!requireAdmin()) return;

    initCart();
    initAdminTabs();
    renderStats();
    renderProductsTable();
    renderUsersTable();
    bindAdminEvents();
}

document.addEventListener('DOMContentLoaded', initAdmin);