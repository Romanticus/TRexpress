# TRexpress - Сервис управления пользователями

## Описание проекта

TRexpress - это REST API сервис для управления пользователями, разработанный на TypeScript с использованием Express.js и TypeORM. Проект демонстрирует применение современных практик разработки backend-приложений, включая архитектуру MVC, валидацию данных, аутентификацию JWT, middleware для контроля доступа и работу с PostgreSQL.

### Реализованная функциональность

✅ **Аутентификация и авторизация**
- Регистрация новых пользователей с валидацией данных
- Авторизация пользователей с JWT токенами (access + refresh)
- Хеширование паролей с использованием bcrypt

✅ **Управление пользователями**
- Создание пользователей с ролями (admin/user)
- Получение пользователя по ID (с проверкой прав доступа)
- Получение списка пользователей с пагинацией (только для админов)
- Блокировка/разблокировка пользователей

✅ **Безопасность и права доступа**
- Middleware для проверки JWT токенов
- Контроль ролей пользователей
- Валидация входных данных с class-validator
- Обработка ошибок и валидации

### Технологический стек

- **Backend Framework**: Express.js 
- **Language**: TypeScript 
- **Database**: PostgreSQL 
- **ORM**: TypeORM 
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: class-validator + class-transformer
- **Development**: ts-node-dev для hot reload

## Системные требования

- **Node.js**: версия 18.0.0 или выше
- **PostgreSQL**: версия 14.0 или выше
- **npm** или **yarn** для управления зависимостями

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd TRexpress
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка базы данных

Создайте файл `.env` в корне проекта:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=test
POSTGRES_PASSWORD=test
POSTGRES_DB=test
POSTGRES_SYNC=true
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
```

### 4. Запуск PostgreSQL через Docker

```bash
docker-compose up -d
```

### 5. Запуск приложения

**Режим разработки (с hot reload):**
```bash
npm run dev
```

**Продакшн режим:**
```bash
npm run build
npm start
```

Приложение будет доступно по адресу: `http://localhost:3000`

## API Endpoints

### Аутентификация

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|---------|
| `POST` | `/user/auth/register` | Регистрация пользователя | Публичный |
| `POST` | `/user/auth/login` | Авторизация пользователя | Публичный |

### Управление пользователями

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|---------|
| `GET` | `/user/users` | Список пользователей с пагинацией | Только Admin |
| `GET` | `/user/:id` | Получение пользователя по ID | Admin или сам пользователь |
| `PATCH` | `/user/:id/block` | Блокировка пользователя | Admin или сам пользователь |
| `PATCH` | `/user/:id/unblock` | Разблокировка пользователя | Только Admin |

### Примеры использования

#### Регистрация пользователя
```bash
curl -X POST http://localhost:3000/user/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Иван Иванов",
    "birthDate": "1990-01-01",
    "email": "ivan@example.com",
    "password": "password123"
  }'
```

#### Авторизация
```bash
curl -X POST http://localhost:3000/user/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ivan@example.com",
    "password": "password123"
  }'
```

#### Получение пользователя (с токеном)
```bash
curl -X GET http://localhost:3000/user/user-id-here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Структура проекта

```
src/
├── config/          # Конфигурация базы данных
├── controllers/     # Контроллеры для обработки запросов
├── dto/            # Data Transfer Objects для валидации
├── entities/       # Модели данных (TypeORM entities)
├── middlewares/    # Middleware для аутентификации и авторизации
├── repositories/   # Репозитории для работы с данными
├── routes/         # Маршруты API
├── utils/          # Утилиты и константы
└── index.ts        # Точка входа приложения
```

## Модель пользователя

```typescript
interface User {
  id: string;                    // UUID
  fullName: string;             // ФИО
  birthDate: Date;              // Дата рождения
  email: string;                // Email (уникальный)
  password: string;             // Хешированный пароль
  role: 'admin' | 'user';      // Роль пользователя
  isActive: boolean;            // Статус активности
  isBlocked: boolean;           // Статус блокировки
  createdAt: Date;              // Дата создания
  updatedAt: Date;              // Дата обновления
  refreshToken?: string;        // Refresh токен
}
```

## Особенности реализации

- **Архитектура**: Чистая архитектура с разделением на слои (controllers, services, repositories)
- **Валидация**: Автоматическая валидация входных данных с помощью class-validator
- **Безопасность**: JWT токены, хеширование паролей, контроль ролей
- **Обработка ошибок**: Централизованная обработка ошибок с middleware
- **Типизация**: Полная типизация TypeScript для всех компонентов
- **База данных**: Использование TypeORM с автоматической синхронизацией схемы

## Статус проекта

🚀 **Проект завершен** - все требования технического задания реализованы

### Реализованные функции:
- ✅ Регистрация и авторизация пользователей
- ✅ JWT аутентификация с refresh токенами
- ✅ CRUD операции для пользователей
- ✅ Система ролей и прав доступа
- ✅ Валидация данных
- ✅ Обработка ошибок

### Планы по доработке:

🔮 **Краткосрочные улучшения:**
- Добавить логирование (winston)
- Реализовать rate limiting для API
- Добавить тесты (Jest)
- Настроить CI/CD pipeline

