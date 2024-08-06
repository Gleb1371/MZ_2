function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function decodeToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch (e) {
        console.error('Ошибка декодирования токена:', e);
        return null;
    }
}

function isTokenExpired(token) {
    const payload = decodeToken(token);
    if (payload && payload.exp) {
        const expiryDate = new Date(payload.exp * 1000);
        return new Date() > expiryDate;
    }
    return true;
}

function redirectToLogin() {
    window.location.href = '/index.html';
}

// Проверка токена
const token = getCookie('access_token');

if (!token || isTokenExpired(token)) {
    redirectToLogin();
}
