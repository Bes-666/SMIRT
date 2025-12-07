# Быстрый деплой на Netlify

## Способ 1: Через Netlify CLI (самый быстрый)

```bash
# 1. Установите Netlify CLI (если еще не установлен)
npm install -g netlify-cli

# 2. Войдите в Netlify
netlify login

# 3. Инициализируйте проект
netlify init

# 4. Деплой
netlify deploy --prod
```

## Способ 2: Через GitHub/GitLab

1. **Создайте репозиторий на GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ваш-username/ваш-репозиторий.git
git push -u origin main
```

2. **Подключите к Netlify:**
   - Зайдите на [app.netlify.com](https://app.netlify.com)
   - Нажмите "Add new site" → "Import an existing project"
   - Выберите ваш репозиторий
   - Настройки сборки:
     - **Build command:** `npm run build` (или оставьте пустым)
     - **Publish directory:** `public`
   - Нажмите "Deploy site"

3. **Готово!** Ваш сайт будет доступен по адресу `https://ваш-сайт.netlify.app`

## Способ 3: Drag & Drop

1. Зайдите на [app.netlify.com](https://app.netlify.com)
2. Перетащите папку `public` в область "Deploy manually"
3. Готово!

**Примечание:** При деплое через drag & drop функции не будут работать. Используйте способы 1 или 2 для полной функциональности.

## После деплоя

Приложение готово к использованию! Все функции работают сразу.

Если хотите постоянное хранение данных (чтобы сообщения не терялись), переключитесь на версию с Blobs (см. README.md).

