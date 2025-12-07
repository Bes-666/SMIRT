// Используем Netlify Functions путь
const API_URL = '/.netlify/functions/messages';

// DOM элементы
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const authorInput = document.getElementById('authorInput');
const sendButton = document.getElementById('sendButton');

// Загрузка сообщений
async function loadMessages() {
    try {
        const response = await fetch(API_URL);
        const messages = await response.json();
        displayMessages(messages);
    } catch (error) {
        console.error('Error loading messages:', error);
        showError('Не удалось загрузить сообщения');
    }
}

// Отображение сообщений
function displayMessages(messages) {
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<div class="empty-state">Пока нет сообщений. Начните общение!</div>';
        return;
    }

    messagesContainer.innerHTML = messages.map(message => `
        <div class="message">
            <div class="message-header">
                <span class="message-author">${escapeHtml(message.author)}</span>
                <span class="message-time">${formatTime(message.timestamp)}</span>
            </div>
            <div class="message-text">${escapeHtml(message.text)}</div>
        </div>
    `).join('');

    // Плавная прокрутка вниз
    requestAnimationFrame(() => {
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    });
}

// Отправка сообщения
async function sendMessage() {
    const text = messageInput.value.trim();
    const author = authorInput.value.trim() || 'Anonymous';

    if (!text) {
        return;
    }

    // Блокируем кнопку
    sendButton.disabled = true;
    sendButton.textContent = 'Отправка...';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, author }),
        });

        if (response.ok) {
            messageInput.value = '';
            // На мобильных убираем фокус после отправки, чтобы скрыть клавиатуру
            if (isMobile) {
                messageInput.blur();
            }
            await loadMessages();
        } else {
            showError('Не удалось отправить сообщение');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showError('Ошибка при отправке сообщения');
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = 'Отправить';
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
        return 'только что';
    }

    // Если сегодня
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // Если вчера
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'вчера ' + date.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // Иначе полная дата
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

authorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        messageInput.focus();
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


// Автообновление сообщений каждые 2 секунды
setInterval(loadMessages, 2000);

// Загрузка сообщений при загрузке страницы
loadMessages();

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

