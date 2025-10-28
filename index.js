// index.js (замінити / додати в проєкт)
import { Telegraf, Markup } from 'telegraf';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import fsSync from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import https from 'https';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

const app = express();

app.use('/files', express.static(UPLOAD_DIR));

app.get('/', async (req, res) => {
  try {

    if (!fsSync.existsSync(UPLOAD_DIR)) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }

    const files = await fs.readdir(UPLOAD_DIR);
    // Фільтруємо тільки .apk
    const apkFiles = (files || []).filter((f) => f.toLowerCase().endsWith('.apk'));


    let latestFile = apkFiles[0];
    let latestTime = 0;
    for (const f of apkFiles) {
      const stat = await fs.stat(path.join(UPLOAD_DIR, f));
      const mtime = stat.mtimeMs;
      if (mtime > latestTime) {
        latestTime = mtime;
        latestFile = f;
      }
    }

    const downloadHref = `/download/${encodeURIComponent(latestFile)}`;
    const publicDownloadFull = `${PUBLIC_URL}${downloadHref}`;

//${downloadHref}

res.send(`
  
  <!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Всё для Водителя — суперапп для автомобилиста</title>
  <meta name="description" content="Современное приложение для водителя: маршруты, GPS‑трекер со статистикой, парковки, цены на топливо, штрафы ГИБДД с уведомлениями, видеорегистратор с AI, AI‑ассистент с голосовым управлением и режим таксиста с синхронизацией аккаунта." />

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet" />

  <style>
    :root {
      /* Яндекс‑стиль: чёрный + фирменный жёлтый */
      --bg: #0b0b0b;          /* глубокий чёрный */
      --panel: #1a1a1a;       /* графитовая панель */
      --panel-2: #141414;     /* более тёмная панель */
      --text: #ffffff;        /* основной текст */
      --muted: #bfbfbf;       /* вторичный текст (тёплый серый) */
      --accent: #ffcc00;      /* фирменный жёлтый */
      --accent-dark: #e5b800; /* тёплый жёлтый для градиента */
      --border: rgba(255,255,255,0.08);
      --glow: 0 0 22px rgba(255,204,0,0.35);
      --radius: 14px;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    .container { max-width: 1140px; margin: 0 auto; padding: 0 20px; }
    section { padding: 90px 0; position: relative; }

    h1, h2, h3 { font-weight: 800; letter-spacing: -0.02em; }
    p { color: var(--muted); }

    /* Header */
    header { position: sticky; top: 0; z-index: 999; background: rgba(11,11,11,0.85); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
    .header-inner { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; }
    .logo { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text); font-weight: 900; font-size: 1.25rem; }
    .logo-badge { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #1f1f1f, #121212); border: 1px solid var(--border); display: grid; place-items: center; box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
    .logo-badge i { color: var(--accent); text-shadow: 0 0 6px rgba(255,204,0,0.9); }
    .logo span { color: var(--accent); text-shadow: 0 0 8px rgba(255,204,0,0.6); }

    .btn { display: inline-flex; align-items: center; gap: 10px; padding: 12px 24px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08); background: linear-gradient(180deg, #1d1d1d, #121212); color: var(--text); text-decoration: none; font-weight: 700; transition: transform .25s ease, box-shadow .25s ease, background .25s ease; }
    .btn:hover { transform: translateY(-2px); box-shadow: var(--glow); }
    .btn-primary { background: linear-gradient(180deg, var(--accent), var(--accent-dark)); color: #141414; border: none; box-shadow: 0 0 25px rgba(255,204,0,0.35), inset 0 -1px 0 rgba(0,0,0,0.25); position: relative; }
    .btn-primary::after { content: ""; position: absolute; inset: -6px; border-radius: 999px; box-shadow: 0 0 24px rgba(255,204,0,0.35); opacity: 0; transition: opacity .3s ease; }
    .btn-primary:hover::after { opacity: 1; }
    /* Пульс CTA */
    .pulse { animation: pulse 1.8s infinite ease-in-out; }
    @keyframes pulse { 0%, 100% { transform: translateY(0) scale(1); box-shadow: 0 0 20px rgba(255,204,0,0.28);} 50% { transform: translateY(-2px) scale(1.02); box-shadow: 0 0 36px rgba(255,204,0,0.45);} }

    /* Hero */
    .hero { text-align: center; position: relative; overflow: hidden; padding: 120px 0 90px; }
    .hero::before { content: ""; position: absolute; inset: -30% -10% auto -10%; height: 70%; background: radial-gradient(circle at 50% 50%, rgba(255,204,0,0.09), transparent 70%); filter: blur(48px); }
    .hero h1 { font-size: 3.4rem; margin-bottom: 18px; text-shadow: 0 0 10px rgba(255,204,0,0.25); }
    .hero p { font-size: 1.2rem; max-width: 820px; margin: 0 auto 28px; }
    .hero-cta { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

    /* Разделитель — «линия дороги» */
    .roadline::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: repeating-linear-gradient(90deg, rgba(255,204,0,0.8) 0 40px, rgba(255,204,0,0.15) 40px 80px); opacity: 0.7; }

    /* Section titles */
    .section-title { text-align: center; margin-bottom: 56px; }
    .section-title h2 { font-size: 2.4rem; margin-bottom: 10px; text-shadow: 0 0 8px rgba(255,204,0,0.2); }
    .section-title p { max-width: 780px; margin: 0 auto; }

    /* Features grid */
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
    .feature-card { background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; transition: transform .2s ease, box-shadow .2s ease; }
    .feature-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(0,0,0,0.35), 0 0 18px rgba(255,204,0,0.25); }
    .feature-icon { font-size: 1.6rem; color: var(--accent); text-shadow: 0 0 6px rgba(255,204,0,0.6); margin-bottom: 10px; }

    /* How it works */
    .how { background: var(--panel-2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .steps { display: flex; gap: 28px; }
    .step { flex: 1; text-align: center; background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; }
    .step-num { width: 56px; height: 56px; border-radius: 14px; display: grid; place-items: center; font-weight: 900; background: linear-gradient(180deg, var(--accent), var(--accent-dark)); color: #141414; margin: 0 auto 14px; box-shadow: var(--glow); }

    /* Function rows */
    .function { display: flex; align-items: center; gap: 48px; margin-bottom: 70px; }
    .function:last-child { margin-bottom: 0; }
    .function:nth-child(even) { flex-direction: row-reverse; }
    .function-text, .function-visual { flex: 1; }
    .function-visual { text-align: center; font-size: 84px; opacity: .95; }
    .function-visual i { background: linear-gradient(180deg, var(--accent), var(--accent-dark)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 10px rgba(255,204,0,0.25)); }
    .function-text h3 { font-size: 1.8rem; margin-bottom: 10px; }
    .function-text p { margin-bottom: 14px; }
    .function-text ul { list-style: none; display: grid; gap: 8px; }
    .function-text li { position: relative; padding-left: 26px; }
    .function-text li:before { content: "\f00c"; font-family: "Font Awesome 6 Free"; font-weight: 900; position: absolute; left: 0; color: var(--accent); }

    /* Taxi highlight */
    .taxi { background: linear-gradient(180deg, #151515, #0f0f0f); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .taxi .grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 28px; }
    .callout { border: 1px dashed rgba(255,204,0,0.5); border-radius: var(--radius); padding: 18px; background: rgba(255,204,0,0.06); color: #ffe07a; font-weight: 600; }

    /* Reviews */
    .reviews { background: var(--panel); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .reviews-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; }
    .review { background: #1d1d1d; border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; display: grid; grid-template-columns: 52px 1fr; gap: 14px; }
    .avatar { width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; color: #141414; background: linear-gradient(180deg, var(--accent), var(--accent-dark)); box-shadow: 0 0 16px rgba(255,204,0,0.25); }
    .review h4 { font-size: 1rem; margin-bottom: 6px; }
    .review p { color: var(--muted); }
    .review small { display: block; margin-top: 10px; color: #d9d9d9; opacity: .85; }

    /* FAQ */
    .faq { background: var(--panel-2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    details { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; }
    details[open] { box-shadow: 0 0 16px rgba(255,204,0,0.14); }
    summary { cursor: pointer; list-style: none; font-weight: 700; }
    summary::-webkit-details-marker { display: none; }
    .faq-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }

    /* CTA */
    .cta { text-align: center; background: var(--panel-2); border-top: 1px solid var(--border); }
    .cta h2 { font-size: 2.4rem; margin-bottom: 14px; text-shadow: 0 0 8px rgba(255,204,0,0.2); }
    .cta p { margin-bottom: 24px; }

    /* Footer */
    footer { padding: 36px 0; text-align: center; color: var(--muted); font-size: 0.95rem; }
    footer a { color: var(--muted); text-decoration: underline dotted; }
    .made { margin-top: 8px; color: #d2c074; opacity: 0.9; }

    /* Reveal on scroll */
    .reveal { opacity: 0; transform: translateY(18px); transition: opacity .6s ease, transform .6s ease; }
    .reveal.in { opacity: 1; transform: translateY(0); }

    /* Responsive */
    @media (max-width: 992px) {
      .features-grid { grid-template-columns: repeat(2, 1fr); }
      .function { flex-direction: column; text-align: center; }
      .function:nth-child(even) { flex-direction: column; }
      .taxi .grid { grid-template-columns: 1fr; }
      .reviews-grid, .faq-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.3rem; }
      .section-title h2 { font-size: 1.9rem; }
      .features-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container header-inner">
      <a class="logo" href="index.html#">
        <span class="logo-badge"><i class="fa-solid fa-car"></i></span>
        Всё для <span>Водителя</span>
      </a>
      <nav class="nav-cta" aria-label="Основная навигация">
        <a class="btn" href="index.html#features"><i class="fa-solid fa-list"></i> Возможности</a>
        <a class="btn btn-primary pulse" href="${downloadHref}"><i class="fa-solid fa-download"></i> Скачать APK</a>
      </nav>
    </div>
  </header>

  <main>
    <!-- HERO -->
    <section class="hero roadline">
      <div class="container">
        <h1 class="reveal">Ваш личный автоассистент — в одном приложении</h1>
        <p class="reveal">Маршруты и GPS‑трекер со статистикой, парковки и зоны, цены на топливо, штрафы ГИБДД с уведомлениями, AI‑видеорегистратор, AI‑ассистент с голосовым управлением и режим таксиста с синхронизацией аккаунта.</p>
        <div class="hero-cta reveal">
          <a class="btn btn-primary pulse" href="Всё%20для%20водителя.apk"><i class="fa-solid fa-download"></i> Скачать APK</a>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section id="features" class="roadline">
      <div class="container">
        <div class="section-title reveal">
          <h2>Ключевые возможности</h2>
          <p>Собрали всё, что нужно водителю ежедневно — без переключения между десятком разных сервисов.</p>
        </div>

        <div class="features-grid">
          <article class="feature-card reveal">
            <div class="feature-icon"><i class="fa-solid fa-route"></i></div>
            <h3>Маршруты и GPS‑трекер</h3>
            <p>Построение маршрута, учёт пробок, сохранение поездок, аналитика: дистанция, время, средняя скорость, экспорт отчётов.</p>
          </article>
          <article class="feature-card reveal">
            <div class="feature-icon"><i class="fa-solid fa-square-parking"></i></div>
            <h3>Парковки и зоны</h3>
            <p>Находите ближние парковки, свободные места, платные/бесплатные зоны. Встроенная навигация до выбранной точки.</p>
          </article>
          <article class="feature-card reveal">
            <div class="feature-icon"><i class="fa-solid fa-gas-pump"></i></div>
            <h3>Топливо рядом</h3>
            <p>Карта АЗС и актуальные цены. Фильтры: ближайшие / самые дешёвые. Обновления в реальном времени.</p>
          </article>
          <article class="feature-card reveal">
            <div class="feature-icon"><i class="fa-solid fa-receipt"></i></div>
            <h3>Штрафы ГИБДД</h3>
            <p>Проверка по номеру авто и ВУ, история, напоминания и моментальные уведомления о новых штрафах.</p>
          </article>
          <article class="feature-card reveal">
            <div class="feature-icon"><i class="fa-solid fa-video"></i></div>
            <h3>AI‑видеорегистратор</h3>
            <p>Запись с камеры телефона. Автосохранение при толчке/ударе. Распознавание опасностей и событий с помощью AI.</p>
          </article>
          <article class="feature-card reveal">
            <div class="feature-icon"><i class="fa-solid fa-bullhorn"></i></div>
            <h3>AI‑ассистент с голосовым управлением</h3>
            <p>Голосовой помощник для водителя: строит маршруты по команде, управляет навигацией и музыкой, озвучивает уведомления и помогает без отвлечения от дороги</p>
          </article>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="how roadline">
      <div class="container">
        <div class="section-title reveal">
          <h2>Как это работает</h2>
          <p>Просто установите приложение, включите доступ к геоданным — и все функции готовы к работе.</p>
        </div>
        <div class="steps">
          <div class="step reveal">
            <div class="step-num">1</div>
            <h3>Установите и войдите</h3>
            <p>Скачайте APK и авторизуйтесь. Синхронизация данных и резервные копии — автоматически.</p>
          </div>
          <div class="step reveal">
            <div class="step-num">2</div>
            <h3>Выберите режим</h3>
            <p>Обычный водитель, дальнобой или таксист — интерфейс и аналитика подстраиваются под задачи.</p>
          </div>
          <div class="step reveal">
            <div class="step-num">3</div>
            <h3>Езжайте и экономьте</h3>
            <p>Точный маршрут, дешёвое топливо, быстрый паркинг и автоматическая фиксация событий.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FUNCTION BLOCKS -->
    <section class="roadline">
      <div class="container">
        <div class="function reveal">
          <div class="function-text">
            <h3>GPS‑трекер с аналитикой</h3>
            <p>Подробная статистика по каждой поездке и по периодам: дистанция, скорость, время в пути, простои. Экспорт в CSV/PDF.</p>
            <ul>
              <li>Сохранение и теги поездок</li>
              <li>Сводки за день/неделю/месяц</li>
              <li>Отчёты «Расходы/км» и «Время за рулём»</li>
            </ul>
          </div>
          <div class="function-visual"><i class="fa-solid fa-chart-line"></i></div>
        </div>

        <div class="function reveal">
          <div class="function-text">
            <h3>Парковки: свободные места и зоны</h3>
            <p>Живые статусы парковок: свободно/занято, тарифы и ограничения. Строим кратчайший маршрут до въезда.</p>
            <ul>
              <li>Платные/бесплатные/резидентские зоны</li>
              <li>Фильтры по цене и расстоянию</li>
              <li>Избранные парковки у дома/работы</li>
            </ul>
          </div>
          <div class="function-visual"><i class="fa-solid fa-square-parking"></i></div>
        </div>

        <div class="function reveal">
          <div class="function-text">
            <h3>Топливо: цены на карте</h3>
            <p>Сравнивайте цены по маркам топлива и выбирайте, что важнее — ближе или дешевле. История цен и тренды.</p>
            <ul>
              <li>Заправки по пути</li>
              <li>Фильтр по марке и сервису</li>
              <li>Обновления в реальном времени</li>
            </ul>
          </div>
          <div class="function-visual"><i class="fa-solid fa-gas-pump"></i></div>
        </div>

        <div class="function reveal">
          <div class="function-text">
            <h3>Штрафы ГИБДД с уведомлениями</h3>
            <p>Проверка по номеру авто и ВУ, история платежей и напоминания. Новые штрафы — сразу в пуш‑уведомлениях.</p>
            <ul>
              <li>Хронология и статусы</li>
              <li>Скан VIN и OCR документов</li>
              <li>Ссылки на оплату (по желанию)</li>
            </ul>
          </div>
          <div class="function-visual"><i class="fa-solid fa-scale-balanced"></i></div>
        </div>

        <div class="function reveal">
          <div class="function-text">
            <h3>AI‑видеорегистратор</h3>
            <p>Камера телефона превращается в регистратор. Кольцевая запись, автосохранение по событию (удар/толчок), распознавание опасностей.</p>
            <ul>
              <li>HUD‑индикаторы и ночной режим</li>
              <li>Автозапуск при движении</li>
              <li>Архив записей в «облаке»</li>
            </ul>
          </div>
          <div class="function-visual"><i class="fa-solid fa-video"></i></div>
        </div>

        <div class="function reveal">
          <div class="function-text">
            <h3>AI‑ассистент с голосовым управлениемя</h3>
            <p>Голосовой помощник для водителя: строит маршруты по команде, управляет навигацией и музыкой, озвучивает уведомления и помогает без отвлечения от дороги</p>
            <ul>
              <li>Составление маршрута по голосу</li>
              <li>Управление навигацией и музыкой</li>
              <li>Работает онлайн и оффлайн</li>
            </ul>
          </div>
          <div class="function-visual"><i class="fa-solid fa-microphone"></i></div>
        </div>
      </div>
    </section>

    <!-- TAXI MODE HIGHLIGHT -->
    <section class="taxi roadline">
      <div class="container">
        <div class="section-title reveal">
          <h2>Режим таксиста и синхронизация аккаунта</h2>
        </div>
        <div class="grid">
          <div class="reveal">
            <h3 style="margin-bottom:10px">Что доступно в режиме таксиста</h3>
            <ul style="list-style:none; display:grid; gap:8px;">
              <li style="position:relative; padding-left:26px"><span style="position:absolute; left:0; color:var(--accent);">✔</span> Учёт заказов, времени на линии и перерывов</li>
              <li style="position:relative; padding-left:26px"><span style="position:absolute; left:0; color:var(--accent);">✔</span> Доходы/расходы, комиссия, чистая прибыль</li>
              <li style="position:relative; padding-left:26px"><span style="position:absolute; left:0; color:var(--accent);">✔</span> Отчёты по сменам и целям</li>
              <li style="position:relative; padding-left:26px"><span style="position:absolute; left:0; color:var(--accent);">✔</span> Синхронизация аккаунта таксиста с функцией такси</li>
            </ul>
          </div>
          <div class="callout reveal"><i class="fa-solid fa-plug-circle-bolt"></i> Поддерживается синхронизация с аккаунтом такси‑сервисов и профилями парка — данные подтягиваются автоматически.</div>
        </div>
      </div>
    </section>

    <!-- REVIEWS -->
    <section class="reviews roadline">
      <div class="container">
        <div class="section-title reveal">
          <h2>Отзывы водителей</h2>
          <p>Мы собрали реальные комментарии — спокойные и по делу, как у людей, для которых машина — инструмент каждый день.</p>
        </div>
        <div class="reviews-grid">
          <article class="review reveal">
            <div class="avatar">ИВ</div>
            <div>
              <h4>Иван, Москва</h4>
              <p>Установил «Всё для Водителя» пару недель назад. Понравилось, что не нужно прыгать между разными приложениями — маршрут, парковка и цены на бензин в одном месте. Уведомление о штрафе пришло сразу, оплатил по ссылке, без лишних действий.</p>
              <small>Пользуюсь ежедневно — экономит время на поездках по работе.</small>
            </div>
          </article>
          <article class="review reveal">
            <div class="avatar">ЕС</div>
            <div>
              <h4>Екатерина, Санкт‑Петербург</h4>
              <p>Чаще всего пользуюсь поиском парковок в центре. Приложение показывает, где есть свободные места и сколько стоит — это реально помогает, когда спешишь. Ещё отмечу регистратор: включается автоматически, качество записи достойное.</p>
              <small>Хороший баланс «ничего лишнего» и нужных функций.</small>
            </div>
          </article>
          <article class="review reveal">
            <div class="avatar">СМ</div>
            <div>
              <h4>Сергей, Екатеринбург</h4>
              <p>GPS‑трекер оказался полезным не только ради интереса. Сохраняю поездки и смотрю статистику по времени и средним скоростям. Для дальних выездов удобно — видно, где были простои, сколько вышло по километражу и расходам.</p>
              <small>Интерфейс понятный, отвлекаться не приходится.</small>
            </div>
          </article>
          <article class="review reveal">
            <div class="avatar">АЛ</div>
            <div>
              <h4>Алексей, Казань</h4>
              <p>Оценил AI‑ассистента — голосом строю маршрут и получаю подсказки без касаний. Удобно, когда руки на руле, а глаза на дороге. Работает чётко!</p>
              <small>Голосовое управление — реально спасает в дороге</small>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="faq roadline">
      <div class="container">
        <div class="section-title reveal">
          <h2>FAQ — часто задаваемые вопросы</h2>
        </div>
        <div class="faq-grid">
          <details class="reveal"><summary>Как проверить штрафы ГИБДД в приложении?</summary>
            <p>Откройте раздел «Штрафы», укажите номер автомобиля и/или данные ВУ. Приложение проверит текущие начисления и отправит уведомление, если появятся новые. История платежей сохраняется в профиле.</p>
          </details>
          <details class="reveal"><summary>GPS‑трекер пишет поездку всегда или только по команде?</summary>
            <p>По умолчанию используется автостарт при движении. В настройках можно включить ручной режим и задавать собственные теги для поездок. Сводки формируются по дням, неделям и месяцам.</p>
          </details>
          <details class="reveal"><summary>Данные о парковках и ценах на топливо актуальные?</summary>
            <p>Да, статусы паркомест и цены на АЗС регулярно обновляются. Можно сортировать по расстоянию или цене, а также смотреть заправки «по пути» на построенном маршруте.</p>
          </details>
          <details class="reveal"><summary>Видеорегистратор — это отдельное приложение?</summary>
            <p>Нет, это встроенный модуль. Запись идёт в кольцевом режиме, есть автосохранение при толчке/ударе. Для распознавания событий используется AI, а архив можно хранить локально или в облаке.</p>
          </details>
          <details class="reveal"><summary>Есть ли режим таксиста и синхронизация аккаунта?</summary>
            <p>Да. Доступны учёт заказов и времени на линии, доходы/расходы и отчёты по сменам. Поддерживается синхронизация аккаунта такси‑сервиса и профилей парка.</p>
          </details>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta roadline">
      <div class="container">
        <h2 class="reveal">Готов к поездке прямо сейчас</h2>
        <p class="reveal">Все функции активны сразу после установки. Никаких подписок и ограничений.</p>
        <div class="hero-cta reveal">
          <a class="btn btn-primary pulse" href="${downloadHref}"><i class="fa-solid fa-download"></i> Скачать APK</a>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <p>© 2025 Всё для Водителя. Все права защищены.<br />
        <a href="index.html#">Политика конфиденциальности</a> | <a href="index.html#">Условия использования</a>
      </p>
      <div class="made">Сделано с заботой о водителях</div>
    </div>
  </footer>

  <script>
    // Intersection Observer: плавные появления
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => observer.observe(el));
  </script>
</body>
</html>
  `)
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Маршрут, який віддає файл з заголовком для завантаження
app.get('/download/:name', async (req, res) => {
  try {
    const name = req.params.name;
    // безпечна перевірка шляху
    if (name.includes('..')) return res.status(400).send('Bad filename');
    const filePath = path.join(UPLOAD_DIR, name);
    if (!fsSync.existsSync(filePath)) return res.status(404).send('File not found');
    return res.download(filePath, 'AuraMatch.apk');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
});


const bot = new Telegraf(process.env.BOT_TOKEN);


bot.on('document', async (ctx) => {
  try {
    const doc = ctx.message.document;
    const fileName = doc.file_name || '';
    const isApkByMime = doc.mime_type === 'application/vnd.android.package-archive';
    const isApkByName = fileName.toLowerCase().endsWith('.apk');

    if (!(isApkByMime || isApkByName)) {
      return ctx.reply('❌ Приймаю лише APK-файли (.apk) — надішли як документ.');
    }

    const file = await ctx.telegram.getFile(doc.file_id);
    const downloadUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

    const buf = await new Promise((resolve, reject) => {
      https.get(downloadUrl, (res) => {
        const data = [];
        res.on('data', (chunk) => data.push(chunk));
        res.on('end', () => resolve(Buffer.concat(data)));
      }).on('error', reject);
    });

    if (buf.length < 1_000_000) {
      return ctx.reply('⚠️ Файл пошкоджений. Надішли APK **як документ**, не як фото.');
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filePath = path.join(UPLOAD_DIR, 'AuraMatch.apk');

    if (fsSync.existsSync(filePath)) {
      await fs.unlink(filePath);
    }

    await fs.writeFile(filePath, buf);

    const fileUrl = `${PUBLIC_URL}/download/AuraMatch.apk`;
    await ctx.reply(`✅ APK завантажено!\n📦 `, { parse_mode: 'Markdown' });

  } catch (e) {
    console.error(e);
    await ctx.reply('⚠️ Помилка при обробці файлу');
  }
});



bot.on(['photo','video','text','audio'], (ctx) =>
  ctx.reply('📦 Надішли .apk як документ (File) — не як фото або відео.')
);

bot.launch();
console.log('🤖 Бот запущений');
app.listen(PORT, () => console.log(`✅ HTTP server запущено на :${PORT}`));
