const API_URL = 'http://localhost:5001/api';
const TOKEN_KEY = 'jwt_token';

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const protectedContent = document.getElementById('protectedContent');
const unauthorizedMessage = document.getElementById('unauthorizedMessage');
const userData = document.getElementById('userData');
const logoutBtn = document.getElementById('logoutBtn');
const messageDiv = document.getElementById('message');
const carBrandSelect = document.getElementById('carBrand');

function showMessage(message, isError = false) {
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = isError ? 'message error' : 'message success';

    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 5000);
}

function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function saveUserPreferences(preferences) {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
}

function getUserPreferences() {
    const prefs = localStorage.getItem('user_preferences');
    return prefs ? JSON.parse(prefs) : null;
}

function isAuthenticated() {
    return getToken() !== null;
}

function updateNavigation() {
    const isLoggedIn = isAuthenticated();
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const favoriteBrand = carBrandSelect ? carBrandSelect.value : '';

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (favoriteBrand) {
                    saveUserPreferences({ favoriteBrand });
                }

                showMessage(data.message);
                registerForm.reset();

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showMessage(data.message, true);
            }
        } catch (error) {
            showMessage('Ошибка при регистрации: ' + error.message, true);
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember')?.checked || false;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                saveToken(data.token);
                showMessage('Вход выполнен успешно! Добро пожаловать в ваш гараж.');
                loginForm.reset();

                setTimeout(() => {
                    window.location.href = 'protected.html';
                }, 1500);
            } else {
                showMessage(data.message, true);
            }
        } catch (error) {
            showMessage('Ошибка при входе: ' + error.message, true);
        }
    });
}

async function loadUserDashboard() {
    if (!isAuthenticated()) return;

    try {
        const response = await fetch(`${API_URL}/protected`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            protectedContent.classList.remove('hidden');
            unauthorizedMessage.classList.add('hidden');

            userData.innerHTML = `
                <h3><i class="fas fa-user-circle"></i> Профиль водителя</h3>
                <div class="user-details">
                    <p><strong>ID:</strong> ${data.user.id}</p>
                    <p><strong>Имя:</strong> ${data.user.username}</p>
                    <p><strong>Статус:</strong> <span class="status-tag">Активный</span></p>
                </div>
            `;

            const preferences = getUserPreferences();
            if (preferences && preferences.favoriteBrand) {
                const brandElem = document.createElement('p');
                brandElem.innerHTML = `<strong>Любимая марка:</strong> ${preferences.favoriteBrand.toUpperCase()}`;
                userData.querySelector('.user-details').appendChild(brandElem);
            }

            animateGarageElements();
        } else {
            removeToken();
            showMessage(data.message, true);
        }
    } catch (error) {
        removeToken();
        showMessage('Ошибка при загрузке данных: ' + error.message, true);
    }
}

function animateGarageElements() {
    const elements = document.querySelectorAll('.stat-card, .car-card');

    elements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 50);
        }, index * 100);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        removeToken();
        showMessage('Вы вышли из системы');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
}

if (protectedContent && unauthorizedMessage) {
    if (isAuthenticated()) {
        loadUserDashboard();
    } else {
        protectedContent.classList.add('hidden');
        unauthorizedMessage.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});