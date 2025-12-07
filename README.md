# Простой Мессенджер MVP для Netlify

Быстрое MVP приложение для обмена сообщениями, готовое к деплою на Netlify.

## Возможности

- ✅ Отправка сообщений
- ✅ Отображение всех сообщений
- ✅ Указание имени отправителя
- ✅ Автоматическое обновление сообщений
- ✅ Красивый современный интерфейс
- ✅ Хранение сообщений в Netlify Blobs
- ✅ Готово к деплою на Netlify

## Локальная разработка

1. Установите зависимости:
```bash
npm install
```

2. Установите Netlify CLI (если еще не установлен):
```bash
npm install -g netlify-cli
```

3. Запустите локальный сервер:
```bash
npm start
# или
netlify dev
```

Приложение будет доступно по адресу: http://localhost:8888

## Деплой на Netlify

### Вариант 1: Через Netlify CLI

1. Войдите в Netlify:
```bash
netlify login
```

2. Инициализируйте сайт:
```bash
netlify init
```

3. Деплой:
```bash
netlify deploy --prod
```

### Вариант 2: Через GitHub/GitLab

1. Создайте репозиторий на GitHub/GitLab
2. Загрузите код:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

3. Зайдите на [netlify.com](https://netlify.com)
4. Нажмите "Add new site" → "Import an existing project"
5. Выберите ваш репозиторий
6. Настройки сборки:
   - Build command: `npm run build` (или оставьте пустым)
   - Publish directory: `public`
7. Нажмите "Deploy site"

### Хранение данных

Приложение использует упрощенную версию с хранением в памяти:
- ✅ Работает сразу без настройки
- ✅ Не требует дополнительных зависимостей
- ⚠️ Данные не сохраняются между перезапусками serverless функций

**Примечание:** Для production с постоянным хранением рекомендуется использовать Netlify Blobs или внешнюю базу данных.

## Технологии

- **Backend**: Netlify Functions (Serverless)
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Хранение**: Netlify Blobs Storage
- **Хостинг**: Netlify

## API Endpoints

Все эндпоинты доступны через Netlify Functions:

- `GET /.netlify/functions/messages` - Получить все сообщения
- `POST /.netlify/functions/messages` - Отправить новое сообщение
  ```json
  {
    "text": "Текст сообщения",
    "author": "Имя отправителя (необязательно)"
  }
  ```
- `DELETE /.netlify/functions/messages/:id` - Удалить сообщение

## Структура проекта

```
SMIRT/
├── netlify/
│   └── functions/
│       └── messages.js    # Netlify Function для API
├── public/
│   ├── index.html         # Главная страница
│   ├── style.css          # Стили
│   └── app.js             # Клиентский JavaScript
├── netlify.toml           # Конфигурация Netlify
├── package.json           # Зависимости
└── README.md              # Документация
```

## Примечания

- Приложение использует Netlify Blobs для хранения сообщений
- Для работы требуется создать Blob store с именем `messages` в настройках Netlify
- Netlify Blobs доступен на всех планах Netlify (включая бесплатный)
# SMIRT
