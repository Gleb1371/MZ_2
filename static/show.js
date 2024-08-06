document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('task_id');
    const accessToken = localStorage.getItem('access_token');

    if (taskId) {
        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const task = await response.json();

            if (response.ok) {
                document.getElementById('textInput1').value = task.heading;
                document.getElementById('textInput2').value = task.task_text;
            } else {
                alert(`Ошибка при загрузке задачи: ${task.error || 'Неизвестная ошибка'}`);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при загрузке задачи.');
        }
    } else {
        alert('Отсутствует идентификатор задачи.');
    }
});