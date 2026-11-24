# Batumi CRM — Инструкция по запуску

## 1. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Перейдите в **SQL Editor** и выполните содержимое файла `supabase/schema.sql`
3. В настройках проекта скопируйте:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role secret key → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Переменные окружения

Создайте файл `.env.local` в корне проекта:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Создание первого администратора

В Supabase Dashboard → **Authentication → Users** → **Add user**:
- Email + Password
- После создания в **SQL Editor**:

```sql
UPDATE public.profiles 
SET role = 'admin', full_name = 'Ваше Имя' 
WHERE email = 'your-admin@email.com';
```

## 4. Запуск локально

```bash
npm install
npm run dev
```

Откройте http://localhost:3000

## 5. Деплой на Vercel

1. Залейте проект в GitHub репозиторий
2. Импортируйте в Vercel
3. Добавьте все три переменные окружения
4. Деплой!

## Структура ролей

- **admin** — полный доступ, управление продавцами и справочниками
- **seller** — видит все объекты, добавляет свои, редактирует только свои

## Права (RLS)

- Объекты: все авторизованные пользователи читают все; пишет только автор или admin
- Пользователи: seller видит только себя; admin видит всех
- Районы: все читают; только admin изменяет
