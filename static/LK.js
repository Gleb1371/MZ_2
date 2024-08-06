document.addEventListener('DOMContentLoaded', function () {
    const currentTasks = document.getElementById('current-tasks');
    const completedTasks = document.getElementById('completed-tasks');
    const saveTaskBtn = document.getElementById('save-task-btn');
    const createTaskModalBtn = document.getElementById('create-task-modal-btn');
    const createModal = document.getElementById('exampleModalCreate') ? new bootstrap.Modal(document.getElementById('exampleModalCreate')) : null;
    const deleteModal = document.getElementById('deleteModal') ? new bootstrap.Modal(document.getElementById('deleteModal')) : null;
    const completeModal = document.getElementById('exampleModalComplete') ? new bootstrap.Modal(document.getElementById('exampleModalComplete')) : null;
    const resumeModal = document.getElementById('exampleModalResume') ? new bootstrap.Modal(document.getElementById('exampleModalResume')) : null;

    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('task_id');
    const category = urlParams.get('category');
    const token = getCookie('access_token');

    let currentCategory = category === 'completed_tasks' ? 'tasks_completed' : 'tasks';

    if (currentTasks) {
        currentTasks.addEventListener('click', function () {
            if (!currentTasks.classList.contains('underline')) {
                currentTasks.classList.add('underline');
                completedTasks.classList.remove('underline');
                currentCategory = 'tasks';
                showTasks(currentCategory);
            }
        });
    }

    if (completedTasks) {
        completedTasks.addEventListener('click', function () {
            if (!completedTasks.classList.contains('underline')) {
                completedTasks.classList.add('underline');
                currentTasks.classList.remove('underline');
                currentCategory = 'tasks_completed';
                showTasks(currentCategory);
            }
        });
    }

    async function showTasks(category) {
        if (!token) {
            console.error('Токен не найден, пользователь не аутентифицирован');
            return;
        }

        const url = category === 'tasks' ? '/tasks' : '/tasks_completed';

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const tasks = await response.json();
                const tasksContainer = document.getElementById('task-list');
                if (tasksContainer) {
                    tasksContainer.innerHTML = '';
                    tasks.forEach(task => {
                        if ((category === 'tasks' && !task.completed) || (category === 'tasks_completed' && task.completed)) {
                            const taskElement = createTaskElement(task);
                            tasksContainer.appendChild(taskElement);
                        }
                    });
                }
            } else {
                console.error('Ошибка при получении задач:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при получении задач:', error);
        }
    }
    
    const createModalElement = document.getElementById('exampleModalCreate');
    const createTaskBtn = document.getElementById('create-task-btn');

    createTaskBtn.addEventListener('click', createTask);

    createModalElement.addEventListener('hidden.bs.modal', () => {
        document.getElementById('recipient-name-create').value = '';
        document.getElementById('message-text-create').value = '';
    });

    async function createTask() {
        if (!token) {
            console.error('Токен не найден, пользователь не аутентифицирован');
            return;
        }

        const heading = document.getElementById('recipient-name-create').value.trim();
        const task_text = document.getElementById('message-text-create').value.trim();

        if (!heading || !task_text) {
            console.error('Название и текст задачи не могут быть пустыми');
            document.getElementById('error-message-create').classList.remove('d-none');
            return;
        }

        document.getElementById('error-message-create').classList.add('d-none');

        const taskData = {
            heading,
            task_text
        };

        try {
            const response = await fetch('/create_task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Задача успешно создана:', result);
                showTasks(currentCategory);

                // Скрываем модальное окно после успешного создания задачи
                const bootstrapModal = bootstrap.Modal.getInstance(createModalElement);
                bootstrapModal.hide();
            } else {
                console.error('Ошибка при создании задачи:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при создании задачи:', error);
        }
    }

    async function deleteTask(taskId) {
        if (!token) {
            console.error('Токен не найден, пользователь не аутентифицирован');
            return;
        }

        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                console.log(`Задача ${taskId} успешно удалена`);
                showTasks(currentCategory); // Обновляем список задач
            } else {
                console.error('Не удалось удалить задачу:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
        }
    }

    async function completeTask(taskId) {
        if (!token) {
            console.error('Токен не найден, пользователь не аутентифицирован');
            return;
        }

        try {
            const response = await fetch(`/tasks/${taskId}/complete`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ completed: true })
            });

            if (response.ok) {
                console.log('Задача успешно завершена');
                showTasks(currentCategory);
            } else {
                console.error('Ошибка при завершении задачи:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при завершении задачи:', error);
        }
    }

    async function resumeTask(taskId) {
        if (!token) {
            console.error('Токен не найден, пользователь не аутентифицирован');
            return;
        }

        try {
            const response = await fetch(`/tasks/${taskId}/resume`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ completed: false })
            });

            if (response.ok) {
                console.log('Задача успешно возобновлена');
                showTasks(currentCategory);
            } else {
                console.error('Ошибка при возобновлении задачи:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при возобновлении задачи:', error);
        }
    }

    document.getElementById('save-task-btn')?.addEventListener('click', function () {
        const heading = document.getElementById('recipient-name-edit').value.trim();
        const task_text = document.getElementById('message-text-edit').value.trim();
        const task_id = document.getElementById('task_id').value;
    
        if (!heading || !task_text) {
            document.getElementById('error-message-edit').classList.remove('d-none');
            return;
        } else {
            document.getElementById('error-message-edit').classList.add('d-none');
        }
    
        saveTask(true, task_id, heading, task_text); // true означает редактирование задачи
    });    

    showTasks(currentCategory);

    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task', 'mb-4');
        taskElement.innerHTML = `
            <div class="d-flex flex-column flex-sm-row justify-content-between">
                <div class="h4 h5-sm h4-md">
                    <strong class="task-name" style="cursor: pointer;">${task.heading}</strong><br>
                    <span class="task-description d-none">${task.task_text}</span>
                </div>
                <div class="d-flex flex-column flex-sm-row">
                    <span class="h4 h5-sm h4-md mb-2 mb-sm-0 me-sm-3 ms-sm-3 edit-task" style="cursor: pointer; color: lime;">Редактировать</span>
                    <span class="h4 h5-sm h4-md mb-2 mb-sm-0 me-sm-3 ms-sm-3 delete-task" style="cursor: pointer; color: red;">Удалить</span>
                    ${task.completed ? '<span class="h4 h5-sm h4-md ms-sm-3 resume-task" style="cursor: pointer; color: #40E0D0;">Возобновить</span>' : '<span class="h4 h5-sm h4-md ms-sm-3 complete-task" style="cursor: pointer; color: #40E0D0;">Завершить</span>'}
                </div>
            </div>
        `;      

        taskElement.querySelector('.task-name').addEventListener('click', () => {
            // Переход на show.html с передачей данных через URL
            window.location.href = `show.html?task_id=${task.task_id}`;
        });

        taskElement.querySelector('.edit-task').addEventListener('click', () => {
            window.location.href = `edit.html?task_id=${task.task_id}`;
        });

        taskElement.querySelector('.delete-task')?.addEventListener('click', function (event) {
            event.stopPropagation();
            const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
            const deleteTaskTitle = document.getElementById('delete-task-title');
            if (confirmDeleteBtn) {
                confirmDeleteBtn.dataset.taskId = task.task_id;
            }
            if (deleteTaskTitle) {
                deleteTaskTitle.textContent = task.heading;
            }
            if (deleteModal) {
                deleteModal.show();
            }
        });

        taskElement.querySelector('.complete-task')?.addEventListener('click', function (event) {
            event.stopPropagation();
            const confirmCompleteBtn = document.getElementById('confirmCompleteBtn');
            const completeTaskTitle = document.getElementById('complete-task-title');
            if (confirmCompleteBtn) {
                confirmCompleteBtn.dataset.taskId = task.task_id;
            }
            if (completeTaskTitle) {
                completeTaskTitle.textContent = task.heading; // Устанавливаем название задачи
            }
            if (completeModal) {
                completeModal.show();
            }
        });

        taskElement.querySelector('.resume-task')?.addEventListener('click', function (event) {
            event.stopPropagation();
            const confirmResumeBtn = document.getElementById('confirmResumeBtn');
            const resumeTaskTitle = document.getElementById('resume-task-title');
            if (confirmResumeBtn) {
                confirmResumeBtn.dataset.taskId = task.task_id;
            }
            if (resumeTaskTitle) {
                resumeTaskTitle.textContent = task.heading; // Устанавливаем название задачи
            }
            if (resumeModal) {
                resumeModal.show();
            }
        });

        return taskElement;
    }

    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function () {
            const taskId = confirmDeleteBtn.dataset.taskId;
            deleteTask(taskId);
            if (deleteModal) {
                deleteModal.hide();
            }
        });
    }

    const confirmCompleteBtn = document.getElementById('confirmCompleteBtn');
    if (confirmCompleteBtn) {
        confirmCompleteBtn.addEventListener('click', function () {
            const taskId = confirmCompleteBtn.dataset.taskId;
            completeTask(taskId);
            if (completeModal) {
                completeModal.hide();
            }
        });
    }

    const confirmResumeBtn = document.getElementById('confirmResumeBtn');
    if (confirmResumeBtn) {
        confirmResumeBtn.addEventListener('click', function () {
            const taskId = confirmResumeBtn.dataset.taskId;
            resumeTask(taskId);
            if (resumeModal) {
                resumeModal.hide();
            }
        });
    }
});