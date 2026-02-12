# LogicTrack CRM

> Примечание: основной исходный код приложения теперь находится в `public/app.jsx` (React в браузере через CDN). (Файл `public/app.js` был перемещён в архив и удалён.)

## Локальный запуск через VS Code

1. Откройте папку проекта в VS Code.
2. Откройте палитру команд (**Cmd/Ctrl + Shift + P**) и выберите **Tasks: Run Task**.
3. Запустите задачу **Serve LogicTrack CRM**.
4. Откройте в браузере `http://localhost:8000` — корневой `index.html` перенаправит на `public/index.html`.

> Остановить сервер можно через **Tasks: Terminate Task**.

## Запуск через npm

В проект добавлен `package.json` с npm-скриптом `start`, который запускает локальный сервер на порту 8000 (используется локально установленный `http-server`). Скрипт **автоматически откроет браузер** после старта.

- Установите зависимости и запустите:

```bash
npm install
npm start
```

- Если не хотите устанавливать зависимости, можно временно запустить через `npx` (передайте флаг `-o` для автоматического открытия браузера):

```bash
npx http-server -p 8000 -o
```

Сервер откроет проект на `http://localhost:8000`.  

## Redirect URI для Google OAuth

При настройке OAuth в Google Cloud Console добавьте один из следующих **Authorized redirect URIs**, совпадающий с `DRIVE_CONFIG.REDIRECT_URI` в `public/app.jsx` (рекомендуется — редирект на корень для простоты):

- `http://localhost:8000/`
- `http://localhost:8000/oauth2callback/`

Если вы используете `http://localhost:8000/`, приложение автоматически обработает `code` из URL после редиректа.

## Серверный обмен кода (рекомендуется для получения refresh_token)

Проект теперь включает небольшой **локальный прокси** для обмена `code` и `refresh_token` с Google (чтобы не хранить `client_secret` в браузере).

1. Создайте `.env` в папке `server/`, скопировав `server/.env.example` и заполнив `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`.
2. Установите зависимости и запустите сервер прокси:

```bash
cd server
npm install
npm start
```

Сервер будет слушать по умолчанию `http://localhost:3000` и предоставляет POST `/oauth/token` (JSON):
- body `{ "code": "..." }` — обмен авторизационного кода на токены
- body `{ "refresh_token": "...", "grant_type": "refresh_token" }` — обновление access token

Прокси добавляет CORS для `http://localhost:8000` и возвращает ответ от Google прямо браузеру.


## Ручной запуск без VS Code

```bash
python -m http.server 8000
```

После запуска откройте `http://localhost:8000`. 
