document.getElementById('loginBtn').addEventListener('click', async (event) => {
    event.preventDefault();

    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');

    // Скрыть сообщение по истечении 5 секунд
    function hideMessage() {
        setTimeout(() => {
            loginMessage.classList.add('d-none');
            loginMessage.textContent = ''; // Очистить текст сообщения
        }, 5000);
    }

    // Убедитесь, что сообщение скрыто изначально
    loginMessage.classList.add('d-none');

    if (login.length > 0 && password.length > 0) {
        try {
            const response = await fetch('/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.access_token) {
                    document.cookie = `access_token=${data.access_token}; path=/; max-age=3600`;
                    localStorage.setItem('access_token', data.access_token);
                    window.location.href = 'LK.html';
                } else {
                    console.error('Токен доступа не получен:', data);
                    loginMessage.textContent = 'Произошла ошибка при входе!';
                    loginMessage.classList.remove('d-none');
                    hideMessage();
                }
            } else if (response.status === 401) {
                loginMessage.textContent = data.error ? `Ошибка: ${data.error}` : 'Неверный логин или пароль!';
                loginMessage.classList.remove('d-none');
                hideMessage();
            } else {
                loginMessage.textContent = 'Произошла ошибка при обработке запроса!';
                loginMessage.classList.remove('d-none');
                hideMessage();
            }
        } catch (error) {
            console.error('Ошибка:', error);
            loginMessage.textContent = 'Произошла ошибка при отправке запроса!';
            loginMessage.classList.remove('d-none');
            hideMessage();
        }
    } else {
        loginMessage.textContent = 'Пожалуйста, заполните все поля!';
        loginMessage.classList.remove('d-none');
        hideMessage();
    }
});
