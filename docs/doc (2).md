## Изменение ордера
Метод позволяет изменить параметры уже созданного ордера

##### Возможности метода:
- Установка или изменение типа оплаты и банка (для ордеров в статусе `new`)
- Передача данных карты или телефона клиента (для ордеров в статусе `customer_confirm`)

> **Важно:**  
> - Поля `type` и `bank` можно менять только если ордер в статусе `new`
> - Поля `customerCardLastDigits`, `customerBank`, `customerName`, `customerPhoneLastDigits` можно менять только если ордер в статусе `customer_confirm`

---

## Endpoint
PATCH /public/api/v1/shop/orders/{id}

Параметр **id** обязателен — это уникальный идентификатор ордера 

## Поля запроса

| Параметр                          | Обязательный | Описание |
|-----------------------------------|--------------|----------|
| `payment.type`                    | ✅           | тип оплаты (например, `card2card`) |
| `payment.bank`                    | ✅           | банк для перевода (например, `sberbank`) |
| `payment.customerBank`            | ❌           | банк клиента |
| `payment.customerName`            | ❌           | имя держателя счета |
| `payment.customerCardLastDigits`  | ❌           | последние 4 цифры карты |
| `payment.customerPhoneLastDigits` | ❌           | последние 4 цифры номера телефона |

---

### Пример запроса через curl
```bash
curl -X PATCH "https://api.example.com/public/api/v1/shop/orders/006c1fca-a9d6-4e10-9564-2fe91262f729" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "payment": {
      "type": "card2card",
      "bank": "sberbank"
    },
    "customerConfirmStatusDetails": "customer_payed"
  }'
```

### Пример успешного ответа
```json
{
  "id": "006c1fca-a9d6-4e10-9564-2fe91262f729",
  "amount": 100,
  "currency": "RUB",
  "status": "new",
  "statusDetails": null,
  "statusTimeoutAt": "2023-10-10T10:10:00.000Z",
  "requisites": null,
  "shop": {
    "name": "test"
  },
  "payment": {},
  "customer": {
    "id": "customer_id",
    "name": "customer name",
    "email": "customer@email.com",
    "phone": null
  },
  "integration": {
    "callbackUrlStatus": null,
    "link": "link_to_env/006c1fca-a9d6-4e10-9564-2fe91262f729/66a1e24b-c6ee-4173-abb4-42e8d385b7aa",
    "token": "66a1e24b-c6ee-4173-abb4-42e8d385b7aa",
    "callbackUrl": "your_shop.com/callback",
    "callbackMethod": "post",
    "externalOrderId": "order_id"
  }
}
```
---
### Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Ошибка валидации или некорректный статус объекта |
| 401 | Не передан авторизационный токен или токен невалиден |
| 404 | Запрошенный ресурс не существует |
| 500 | Непредвиденная ошибка сервера |

### Примеры ошибок

<details><summary><strong>401 Unauthorized</strong></summary>

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
</details> <details> <summary><strong>404 Not Found</strong></summary>

```json
{
  "statusCode": 404,
  "message": "Order not found",
  "error": "Not Found"
}
```
</details> <details> <summary><strong>400 Bad Request</strong></summary>

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": {
    "property": "amount",
    "constraints": {
      "isPositive": "amount must be a positive number"
    }
  }
}
```
</details> <details> <summary><strong>500 Internal Server Error</strong></summary>

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```
