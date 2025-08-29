# API Авторизация

Описание: Этот эндпоинт используется для получения токена пользователя.

## Запрос

```
POST https://%host%/api/login
Content-Type: application/json

{
"username": "user@example.com
",
"password": "password123"
}
```

## Ответ

Успешный ответ:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
Ошибки:

401 Unauthorized — неверный логин/пароль

400 Bad Request — некорректный формат данных


