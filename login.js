/* ============================================================
   FLEX MUSIC — Логика страницы входа / регистрации
   ============================================================ */

'use strict';

// ============================================================
// ПЕРЕКЛЮЧЕНИЕ ТАБОВ
// ============================================================
function initTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.tab;
            loginForm.hidden = target !== 'login';
            registerForm.hidden = target !== 'register';

            // Очищаем ошибки при переключении
            document.querySelectorAll('.auth-field__error').forEach(el => el.textContent = '');
            document.querySelectorAll('.auth-form__error').forEach(el => el.hidden = true);
        });
    });
}

// ============================================================
// ПОКАЗ ОШИБОК
// ============================================================
function showFormError(formId, message) {
    const el = document.getElementById(formId);
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
}

function setFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const error = document.querySelector(`[data-error-for="${fieldId}"]`);
    if (input) input.classList.toggle('is-error', !!message);
    if (error) error.textContent = message || '';
}

function clearAllErrors(form) {
    form.querySelectorAll('input').forEach(i => i.classList.remove('is-error'));
    form.querySelectorAll('.auth-field__error').forEach(e => e.textContent = '');
    form.querySelectorAll('.auth-form__error').forEach(e => e.hidden = true);
}

// ============================================================
// РЕДИРЕКТ ПОСЛЕ ВХОДА
// ============================================================
function getRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('redirect');
    if (!r) return 'index.html';
    // Защита от open-redirect: только относительные пути
    return r.startsWith('/') || /^[a-z0-9._-]+(\.html)?/i.test(r) ? r : 'index.html';
}

// ============================================================
// ОБРАБОТЧИКИ ФОРМ
// ============================================================
function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAllErrors(form);

        const email = form.email.value.trim();
        const password = form.password.value;

        let hasError = false;
        if (!email) { setFieldError('loginEmail', 'Введите email'); hasError = true; }
        if (!password) { setFieldError('loginPassword', 'Введите пароль'); hasError = true; }
        if (hasError) return;

        const result = login({ email, password });

        if (!result.ok) {
            showFormError('loginError', '❌ ' + result.error);
            return;
        }

        showToast(`👋 Добро пожаловать, ${result.user.name}!`);

        const redirect = getRedirectUrl();
        setTimeout(() => window.location.href = redirect, 500);
    });
}

function initRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAllErrors(form);

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const password2 = form.password2.value;

        let hasError = false;
        if (name.length < 2) { setFieldError('regName', 'Минимум 2 символа'); hasError = true; }
        if (!email.includes('@')) { setFieldError('regEmail', 'Некорректный email'); hasError = true; }
        if (password.length < 6) { setFieldError('regPassword', 'Минимум 6 символов'); hasError = true; }
        if (password !== password2) { setFieldError('regPassword2', 'Пароли не совпадают'); hasError = true; }
        if (hasError) return;

        const result = register({ email, password, name });

        if (!result.ok) {
            showFormError('registerError', '❌ ' + result.error);
            return;
        }

        showToast(`🎉 Аккаунт создан! Добро пожаловать, ${result.user.name}`);
        setTimeout(() => window.location.href = 'index.html', 700);
    });
}

// ============================================================
// ПРОВЕРКА URL (после редиректа)
// ============================================================
function checkUrlErrors() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'admin_only') {
        showToast('🔒 Админ-панель доступна только администраторам');
    }

    const redirect = params.get('redirect');
    if (redirect && !isAuthenticated()) {
        showToast('🔒 Войдите, чтобы продолжить');
    }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
function initLoginPage() {
    // Если уже вошёл — редирект
    if (isAuthenticated()) {
        window.location.href = getRedirectUrl();
        return;
    }

    initCart();
    initTabs();
    initLoginForm();
    initRegisterForm();
    checkUrlErrors();
}

document.addEventListener('DOMContentLoaded', initLoginPage);