# Выгрузка ордеров по магазину

Метод позволяет получать список ордеров за произвольный период времени

## Endpoint

#### Получение Payin ордеров
```
GET /api/v1/shop/orders
```

#### Получение Payout ордеров
```
GET /api/v1/shop/payout-orders
```

## Поля запроса

| Параметр | Тип | Обязательный | Описание |
|----------|-----|---------------|----------|
| `from`   | `string` (YYYY-MM-DD) | ✅ | Начало периода выгрузки |
| `to`     | `string` (YYYY-MM-DD) | ✅ | Конец периода выгрузки |
| `status` | `string` | ❌ | Статус ордера |
| `take`   | `integer` | ❌ | Количество записей на страницу (по умолчанию: 100, максимум: 1000) |
| `page`   | `integer` | ❌ | Номер страницы (по умолчанию: 1) |

> **Особенности:** 
> - Сортировка по умолчанию — по дате создания
> - Рекомендованная частота вызовов — **не более 1 запроса в секунду** на один API-ключ
> - Разрешённый период выгрузки — **не более одного дня** за один запрос

---

### Пример запроса через curl
```bash
curl -X GET "https://%demo.host%/public/api/v1/shop/orders?from=2025-08-04&to=2025-08-05&status=cancelled&take=100&page=1" \
  -H "Authorization: Bearer YOUR_API_KEY"
```
### Пример ответа

```json
{
  "items": [
    {
      "id": "200d7de7-5eec-4e85-ad78-9b23f070e36f",
      "initialAmount": 100,
      "amount": 100,
      "currency": "RUB",
      "status": "cancelled",
      "statusDetails": "requisites_timeout",
      "statusTimeoutAt": "2025-08-04T15:22:18.063Z",
      "requisites": null,
      "shop": {
        "name": "shopBalykin",
        "customerDataCollectionOrder": "before_payment",
        "collectCustomerReceipts": false
      },
      "payment": {
        "bank": "sberbank",
        "type": "nspk"
      },
      "customer": {
        "id": "123",
        "ip": null,
        "fingerprint": null,
        "name": null,
        "email": null,
        "phone": null
      },
      "assetCurrencyAmount": 1,
      "shopAmount": null,
      "shopFee": null,
      "currencyRate": 100,
      "integration": {
        "link": "https://demo-sci.tapbank.net/order/200d7de7-5eec-4e85-ad78-9b23f070e36f/f6b3bef8-3a60-4b0a-ba78-7e35b00679f3",
        "token": "f6b3bef8-3a60-4b0a-ba78-7e35b00679f3",
        "callbackUrl": null,
        "callbackMethod": null,
        "callbackUrlStatus": null,
        "returnUrl": null,
        "externalOrderId": null
      }
    }
  ],
  "page": 1,
  "pages": 1,
  "count": 1
}
```