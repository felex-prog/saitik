/* ============================================================
   FLEX MUSIC — Логика главной страницы
   ============================================================ */

'use strict';

function renderBestsellers() {
    const grid = document.getElementById('bestsellersGrid');
    if (!grid) return;

    const bestsellers = getProducts().filter(p => p.bestseller);  
}

    if (bestsellers.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#8fb3cc;">Пока нет хитов продаж</p>';
        return;
    }

    const fragment = document.createDocumentFragment();
    bestsellers.forEach((p, index) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = productCardHTML(p, index);
        fragment.appendChild(wrapper.firstElementChild);
    });

    grid.appendChild(fragment);


function initRevealAnimation() {
    const elements = document.querySelectorAll('.reveal');
    if (elements.length === 0) return;

    if (!('IntersectionObserver' in window)) {
        elements.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
}

function init() {
    renderBestsellers();
    initCart();        // корзина из cart.js
    initRevealAnimation();
}

document.addEventListener('DOMContentLoaded', init);