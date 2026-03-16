# Tryer-Fit Backend

Backend проекта Tryer-Fit на NestJS + TypeORM + PostgreSQL.

## Главное правило

Единственный источник истины по схеме БД в проекте: TypeORM entities и migrations из этого backend.
Единственный рабочий TypeORM data source: [`src/data-source.ts`](./src/data-source.ts).

## Baseline migration

Активная миграционная история была пересобрана в baseline.

- активная папка миграций: `src/migrations`
- архив старой истории: `src/migrations-legacy`
- текущая baseline migration: `src/migrations/1773306775975-Baseline.ts`

Это значит:
- `npm run migration:run` использует только baseline и все новые миграции поверх неё
- старые legacy migration files не участвуют в развороте новой среды

Что это значит:
- изменения схемы делаются только через migration
- локальная БД не инициализируется через `tryer-fit-db/schema.sql`
- если schema в БД не совпадает с кодом, сначала применяются migrations, а не ручные SQL-скрипты

## Как это должно работать

1. Поднять PostgreSQL:

```bash
cd ../tryer-fit-db
docker-compose up -d
```

2. Вернуться в backend и применить миграции:

```bash
cd ../tryer-fit-backend
npm install
npm run migration:run
```

3. Запустить backend:

```bash
npm run start:dev
```

## Demo seed

После чистого разворота БД можно заполнить тестовые данные командой:

```bash
npm run seed:demo
```

Что создаётся:
- 1 тренер
- 1 клиент, привязанный к тренеру
- по 1 записи во всех основных связанных таблицах:
  `progress_reports`, `progress_report_comments`, `nutrition_categories`,
  `nutrition_plans`, `nutrition_days`, `meals`, `client_nutrition_plans`,
  `workout_categories`, `workout_programs`, `workout_days`, `exercises`,
  `client_workout_programs`, `chat_messages`

Тестовые логины:
- тренер: `trainer@example.com` / `Password123!`
- клиент: `client@example.com` / `Password123!`

## Auth flow

Backend использует JWT и выставляет `httpOnly cookie` `token` при `POST /auth/login`.

Это нужно для того, чтобы:
- middleware на frontend мог проверять авторизацию на серверной стороне
- backend мог принимать JWT как из cookie, так и из `Authorization` header

Logout:

```bash
POST /auth/logout
```

Этот endpoint очищает cookie `token`.

## Конфигурация

TypeORM в приложении и миграциях использует один и тот же конфиг из `src/data-source.ts`.

Это означает:
- `TypeOrmModule.forRoot(...)` в Nest берёт настройки из `src/data-source.ts`
- `npm run migration:run` использует тот же `src/data-source.ts`
- файлов `ormconfig.js` и отдельного `data-source.js` больше нет и использовать их не нужно

Подключение к БД читается из переменных окружения:

```text
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=tryerfit
```

## Команды

- `npm run start` - запуск приложения
- `npm run start:dev` - запуск в режиме разработки
- `npm run start:prod` - запуск собранного приложения
- `npm run build` - сборка backend
- `npm run migration:run` - применить миграции
- `npm run migration:revert` - откатить последнюю миграцию
- `npm run seed:demo` - заполнить demo-данные для одного тренера и одного клиента
- `npm run typeorm -- migration:show` - проверить список миграций через тот же `src/data-source.ts`
- `npm run test` - запуск unit-тестов
- `npm run test:e2e` - запуск e2e-тестов

## Важно

Не использовать для создания схемы:

```bash
docker exec -i tryer-fit-db psql -U postgres -d tryerfit -f schema.sql
```

Почему:
- `schema.sql` устарел и не совпадает с текущими entities/migrations
- это приводит к ошибкам вида `relation does not exist`, несовпадению таблиц и конфликтам при запуске backend
- локальный PostgreSQL должен подниматься без `docker-entrypoint-initdb.d` SQL-файлов, а схема должна приезжать только через `npm run migration:run`

## Текущее направление

Проект находится в фазе стабилизации. Приоритеты:
- безопасность API
- консистентность схемы БД
- синхронизация frontend и backend контрактов
- после этого типизация и линтинг
