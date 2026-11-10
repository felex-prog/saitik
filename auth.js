/* ============================================================
   FLEX MUSIC — Авторизация (localStorage)
   ⚠️ ДЕМО-режим! Для продакшена нужен бэкенд + хэширование паролей
   ============================================================ */

'use strict';

const USERS_STORAGE_KEY = 'felex_users';
const SESSION_STORAGE_KEY = 'felex_session';

const DEFAULT_USERS = [
    {
        id: 1,
        email: 'admin@felex.ru',
        password: 'admin123',
        name: 'Администратор',
        role: 'admin',
        createdAt: Date.now()
    },
    {
        id: 2,
        email: 'user@felex.ru',
        password: 'user123',
        name: 'Иван Котов',
        role: 'user',
        createdAt: Date.now()
    }
];

// ============================================================
// ХРАНИЛИЩЕ ПОЛЬЗОВАТЕЛЕЙ
// ============================================================
function getUsers() {
    try {
        const raw = localStorage.getItem(USERS_STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
            return [...DEFAULT_USERS];
        }
        return JSON.parse(raw);
    } catch {
        return [...DEFAULT_USERS];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// ============================================================
// СЕССИЯ
// ============================================================
function getCurrentUser() {
    try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        return getUsers().find(u => u.id === session.id) || null;
    } catch {
        return null;
    }
}

function setSession(user) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        id: user.id,
        role: user.role,
        loggedAt: Date.now()
    }));
}

function isAuthenticated() {
    return getCurrentUser() !== null;
}

function isAdmin() {
    const user = getCurrentUser();
    return user?.role === 'admin';
}

// ============================================================
// РЕГИСТРАЦИЯ / ВХОД / ВЫХОД
// ============================================================
function register({ email, password, name }) {
    email = (email || '').trim().toLowerCase();
    name = (name || '').trim();

    if (!name || name.length < 2) {
        return { ok: false, error: 'Имя должно быть не менее 2 символов' };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { ok: false, error: 'Некорректный email' };
    }
    if (!password || password.length < 6) {
        return { ok: false, error: 'Пароль должен быть не менее 6 символов' };
    }

    const users = getUsers();
    if (users.some(u => u.email === email)) {
        return { ok: false, error: 'Пользователь с таким email уже существует' };
    }

    const newUser = {
        id: Date.now(),
        email,
        password,    
        name,
        role: 'user',
        createdAt: Date.now()
    };

    users.push(newUser);
    saveUsers(users);
    setSession(newUser);

    return { ok: true, user: newUser };
}

function login({ email, password }) {
    email = (email || '').trim().toLowerCase();
    const user = getUsers().find(u => u.email === email && u.password === password);

    if (!user) {
        return { ok: false, error: 'Неверный email или пароль' };
    }

    setSession(user);
    return { ok: true, user };
}

function logout() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
}

// ============================================================
// ЗАЩИТА СТРАНИЦ
// ============================================================
function requireAuth(redirectTo = 'login.html') {
    if (!isAuthenticated()) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `${redirectTo}?redirect=${redirect}`;
        return false;
    }
    return true;
}

function requireAdmin(redirectTo = 'login.html') {
    if (!isAdmin()) {
        window.location.href = `${redirectTo}?error=admin_only`;
        return false;
    }
    return true;
}

// ============================================================
// БЛОК ПРОФИЛЯ В ШАПКЕ
// ============================================================
function renderHeaderAuth() {
    const container = document.getElementById('authArea');
    if (!container) return;

    const user = getCurrentUser();

    if (!user) {
        container.innerHTML = `
            <a href="login.html" class="header-auth-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                Войти
            </a>
        `;
        return;
    }

    const initial = user.name.charAt(0).toUpperCase();
    const roleLabel = user.role === 'admin' ? 'Администратор' : 'Покупатель';

    container.innerHTML = `
        <div class="user-menu" id="userMenu">
            <button class="user-menu__toggle" type="button" aria-label="Профиль">
                <span class="user-avatar">${initial}</span>
                <span class="user-menu__name">${user.name.split(' ')[0]}</span>
                <svg class="user-menu__chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            </button>
            <div class="user-menu__dropdown">
                <div class="user-menu__header">
                    <div class="user-menu__fullname">${user.name}</div>
                    <div class="user-menu__email">${user.email}</div>
                    <span class="user-menu__role ${user.role}">${roleLabel}</span>
                </div>
                ${user.role === 'admin' ? `
                    <a href="admin.html" class="user-menu__item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                        </svg>
                        Админ-панель
                    </a>
                ` : ''}
                <button type="button" class="user-menu__item user-menu__item--logout" id="logoutBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <path d="M16 17l5-5-5-5"/>
                        <path d="M21 12H9"/>
                    </svg>
                    Выйти
                </button>
            </div>
        </div>
    `;

    const menu = document.getElementById('userMenu');
    const toggle = menu.querySelector('.user-menu__toggle');

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('is-open');
    });

    document.addEventListener('click', () => menu.classList.remove('is-open'));

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        logout();
        showToast?.('👋 Вы вышли из аккаунта');
        setTimeout(() => window.location.href = 'index.html', 500);
    });
}

document.addEventListener('DOMContentLoaded', renderHeaderAuth);