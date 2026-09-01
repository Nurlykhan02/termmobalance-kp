# КП — Разработка сайта Termmo Balance

Коммерческое предложение на разработку нового сайта для [Termmo Balance](https://termmobalance.net/).

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:5173

## Сборка

```bash
npm run build
```

Результат в `dist/` — готово для деплоя на Vercel / Cloudflare Pages.

## Деплой

1. Загрузить в GitHub
2. Подключить Vercel или Cloudflare Pages
3. Build command: `npm run build`, Output: `dist`
4. Подключить домен — скинуть клиенту ссылку

## Структура

```
├── index.html          # коммерческое предложение
└── assets/
    ├── css/kp.css      # дизайн в стиле azamat.ai
    └── public/assets/js/theme.js  # тёмная тема (копируется в dist)
```
