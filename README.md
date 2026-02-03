# LogicTrack CRM

## Локальный запуск через VS Code

1. Откройте папку проекта в VS Code.
2. Откройте палитру команд (**Cmd/Ctrl + Shift + P**) и выберите **Tasks: Run Task**.
3. Запустите задачу **Serve LogicTrack CRM**.
4. Откройте в браузере `http://localhost:8000` — корневой `index.html` перенаправит на `public/index.html`.

> Остановить сервер можно через **Tasks: Terminate Task**.

## Ручной запуск без VS Code

```bash
python -m http.server 8000
```

После запуска откройте `http://localhost:8000`.
