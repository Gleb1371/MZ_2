document.addEventListener('DOMContentLoaded', () => {
    // Получение task_id из URL
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('task_id');

    if (!taskId) {
        alert('Ошибка: task_id не найден в URL.');
        return;
    }

    // Загрузка данных задачи и заполнение формы
    fetch(`/tasks/${taskId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
    })
        .then(response => response.json())
        .then(task => {
            if (task.error) {
                alert(task.error);
                window.location.href = 'LK.html'; // Перенаправление на главную страницу, если задача не найдена
            } else {
                document.getElementById('textInput1').value = task.heading;
                document.getElementById('textInput2').value = task.task_text;
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки задачи:', error);
            alert('Произошла ошибка при загрузке задачи.');
        });

    // Обработка отправки формы
    document.querySelector('form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const heading = document.getElementById('textInput1').value.trim();
        const task_text = document.getElementById('textInput2').value.trim();

        // Проверка, чтобы заголовок и текст не были пустыми
        if (!heading || !task_text) {
            Swal.fire({
                title: 'Ошибка!',
                text: 'Заголовок и текст задачи не могут быть пустыми.',
                icon: 'error',
                confirmButtonText: 'ОК'
            });
            return;
        }        

        // Отправка изменений на сервер
        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({ heading, task_text })
            });
        
            if (response.ok) {
                Swal.fire({
                    title: 'Успех!',
                    text: 'Задача успешно обновлена!',
                    icon: 'success',
                    confirmButtonText: 'ОК'
                });
            } else {
                try {
                    const errorData = await response.json();
                    Swal.fire({
                        title: 'Ошибка!',
                        text: `Ошибка: ${errorData.error || 'Неизвестная ошибка'}`,
                        icon: 'error',
                        confirmButtonText: 'Попробовать снова'
                    });
                } catch (parseError) {
                    console.error('Ошибка при разборе ответа JSON:', parseError);
                    Swal.fire({
                        title: 'Ошибка!',
                        text: 'Не удалось разобрать ответ сервера.',
                        icon: 'error',
                        confirmButtonText: 'Попробовать снова'
                    });
                }
            }
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
            Swal.fire({
                title: 'Ошибка!',
                text: 'Произошла ошибка при обновлении задачи.',
                icon: 'error',
                confirmButtonText: 'Попробовать снова'
            });
        }        
        
    });
});
