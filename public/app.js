// Используем Netlify Functions путь
const API_URL = '/.netlify/functions/messages';

// DOM элементы
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// Загрузка сообщений
async function loadMessages(forceUpdate = false) {
    try {
        const response = await fetch(API_URL);
        const messages = await response.json();
        displayMessages(messages, forceUpdate);
    } catch (error) {
        console.error('Error loading messages:', error);
        showError('ERROR: FAILED TO LOAD MESSAGES');
    }
}

// Хранение текущих сообщений для умного обновления
let currentMessages = [];
let lastMessageId = null;

// Проверка, есть ли выделенный текст
function hasSelection() {
    const selection = window.getSelection();
    return selection && selection.toString().length > 0;
}

// Проверка, находится ли пользователь внизу списка сообщений
function isScrolledToBottom() {
    const threshold = 100; // пикселей от низа
    return messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < threshold;
}

// Отображение сообщений
function displayMessages(messages, forceUpdate = false) {
    // Если пользователь выделяет текст или прокрутил вверх, не обновляем
    if (!forceUpdate && (hasSelection() || !isScrolledToBottom())) {
        // Обновляем только данные, но не перерисовываем
        currentMessages = messages;
        return;
    }

    if (messages.length === 0) {
        messagesContainer.innerHTML = '<div class="empty-state">NO MESSAGES DETECTED<br>INITIATE COMMUNICATION...</div>';
        currentMessages = [];
        return;
    }

    // Проверяем, есть ли новые сообщения
    const hasNewMessages = !lastMessageId || 
        messages.some(msg => !currentMessages.find(m => m.id === msg.id));

    // Сохраняем позицию прокрутки если не внизу
    const wasAtBottom = isScrolledToBottom();
    const oldScrollTop = messagesContainer.scrollTop;
    const oldScrollHeight = messagesContainer.scrollHeight;

    messagesContainer.innerHTML = messages.map(message => `
        <div class="message" data-id="${message.id}">
            <div class="message-header">
                <div class="message-header-left">
                    <span class="message-author">${escapeHtml(message.author)}</span>
                    <span class="message-time">${formatTime(message.timestamp)}</span>
                </div>
                <button class="delete-button" onclick="deleteMessage('${message.id}')" title="Delete message">
                    <span class="delete-icon">×</span>
                </button>
            </div>
            <div class="message-text">${escapeHtml(message.text)}</div>
        </div>
    `).join('');

    currentMessages = messages;
    if (messages.length > 0) {
        lastMessageId = messages[messages.length - 1].id;
    }

    // Восстанавливаем позицию прокрутки или прокручиваем вниз
    if (wasAtBottom || hasNewMessages) {
        // Плавная прокрутка вниз
        requestAnimationFrame(() => {
            messagesContainer.scrollTo({
                top: messagesContainer.scrollHeight,
                behavior: 'smooth'
            });
        });
    } else {
        // Восстанавливаем позицию прокрутки
        const newScrollHeight = messagesContainer.scrollHeight;
        const scrollRatio = oldScrollTop / (oldScrollHeight || 1);
        messagesContainer.scrollTop = newScrollHeight * scrollRatio;
    }
}

// Удаление сообщения
async function deleteMessage(messageId) {
    if (!confirm('DELETE THIS MESSAGE?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}?id=${messageId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            await loadMessages(true);
        } else {
            showError('ERROR: FAILED TO DELETE MESSAGE');
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        showError('ERROR: DELETE FAILED');
    }
}

// Отправка сообщения
async function sendMessage() {
    const text = messageInput.value.trim();

    if (!text) {
        return;
    }

    // Блокируем кнопку
    sendButton.disabled = true;
    sendButton.textContent = 'SENDING...';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, author: 'Anonymous' }),
        });

        if (response.ok) {
            messageInput.value = '';
            // На мобильных убираем фокус после отправки, чтобы скрыть клавиатуру
            if (isMobile) {
                messageInput.blur();
            }
            await loadMessages(true); // Принудительное обновление после отправки
        } else {
            showError('ERROR: FAILED TO SEND MESSAGE');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showError('ERROR: TRANSMISSION FAILED');
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = 'SEND';
        messageInput.focus();
    }
}

// Форматирование времени
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Если меньше минуты назад
    if (diff < 60000) {
        return 'NOW';
    }

    // Если сегодня
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });
    }

    // Если вчера
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'YESTERDAY ' + date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        });
    }

    // Иначе полная дата
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Показать ошибку
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Адаптивные стили для мобильных
    const isMobile = window.innerWidth <= 768;
    errorDiv.style.cssText = `
        position: fixed;
        ${isMobile ? 'top: 10px; left: 10px; right: 10px;' : 'top: 20px; right: 20px;'}
        background: #ff4444;
        color: white;
        padding: ${isMobile ? '14px 16px' : '12px 20px'};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-size: ${isMobile ? '14px' : '16px'};
        text-align: center;
    `;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Определение мобильного устройства
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Обработчики событий
sendButton.addEventListener('click', sendMessage);

// Поддержка Enter для отправки
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});


// Обработка виртуальной клавиатуры на мобильных
if (isMobile) {
    let viewportHeight = window.innerHeight;
    
    // Отслеживание изменения размера viewport (появление/скрытие клавиатуры)
    window.addEventListener('resize', () => {
        const currentHeight = window.innerHeight;
        if (currentHeight < viewportHeight * 0.75) {
            // Клавиатура открыта - прокручиваем к последнему сообщению
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
        viewportHeight = currentHeight;
    });
    
    // Прокрутка при фокусе на input
    messageInput.addEventListener('focus', () => {
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 300);
    });
}


// Автообновление сообщений с умной логикой
let autoUpdateInterval = null;

function startAutoUpdate() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
    }
    
    autoUpdateInterval = setInterval(() => {
        // Не обновляем если пользователь выделяет текст
        if (!hasSelection()) {
            loadMessages();
        }
    }, 3000); // Увеличиваем интервал до 3 секунд
}

// Останавливаем автообновление при выделении текста
document.addEventListener('selectionchange', () => {
    if (hasSelection()) {
        if (autoUpdateInterval) {
            clearInterval(autoUpdateInterval);
            autoUpdateInterval = null;
        }
    } else {
        // Возобновляем если нет выделения и интервал остановлен
        if (!autoUpdateInterval) {
            startAutoUpdate();
        }
    }
});

// Останавливаем автообновление при начале выделения
messagesContainer.addEventListener('mousedown', () => {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
        autoUpdateInterval = null;
    }
});

// Возобновляем автообновление через 5 секунд после отпускания мыши
messagesContainer.addEventListener('mouseup', () => {
    setTimeout(() => {
        if (!hasSelection() && !autoUpdateInterval) {
            startAutoUpdate();
        }
    }, 5000);
});

// То же самое для touch событий на мобильных
messagesContainer.addEventListener('touchstart', () => {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
        autoUpdateInterval = null;
    }
});

messagesContainer.addEventListener('touchend', () => {
    setTimeout(() => {
        if (!hasSelection() && !autoUpdateInterval) {
            startAutoUpdate();
        }
    }, 5000);
});

// Запускаем автообновление
startAutoUpdate();

// Загрузка сообщений при загрузке страницы
loadMessages(true); // Принудительное обновление при загрузке

// Фокус на поле ввода (только на десктопе, на мобильных не фокусируем автоматически)
if (!isMobile) {
    messageInput.focus();
}

// Предотвращение двойного тапа для зума на iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

