## Endpoint 
POST `/public/api/v1/order-automation`

Принятие JSON-сообщения от банка

Сообщение должно быть указано в текстовом параметре.
## Поля запроса
| Параметр                          | Обязательный | Описание |
|-----------------------------------|--------------|----------|
| text                 | ✅           | Текст банковского сообщения|
| token                   | ✅           | API ключ реквизита |


---

### Пример запроса через curl
```bash
curl --location 'https://%demo.host%/public/api/v1/order-automation' \
--header 'Content-Type: application/json' \
--data '{
  "text": "сумма 1000 цифры 4566",
  "token": "da469737-8408-447f-9407-14f5f3fb4692"
}'
```

### Пример успешного ответа
```json
{
    "token": "da469737-8408-447f-9407-14f5f3fb4692",
    "requisitesId": "f9dd15f5-b7f8-456f-ae2c-bd012c825a3b",
    "fiatCurrencyId": "55a72bcf-dd17-4dee-8c5e-30b17399d4f5",
    "paymentTypeId": "64912773-4e14-45b6-8d1d-bc3646572fbc",
    "bankId": "191e8695-2123-49be-bea9-1f2ca327ce07",
    "orderAutomationType": "inactive",
    "text": "сумма 1000 цифры 4566",
    "status": "automation_disabled",
    "traderId": "68068b62-28cf-498e-bc5b-22135c4cfc26",
    "requisitesGroupId": null,
    "orderId": null,
    "tradeMethodId": null,
    "automationSourceName": null,
    "automationSourceId": null,
    "notificationType": null,
    "parsedParams": {},
    "initialStatus": null,
    "statusDetails": null,
    "reviewedAt": null,
    "reviewedById": null,
    "conflictedOrdersIds": null,
    "parsingMethodId": null,
    "parsingMethodsIds": null,
    "orderAutomationErrorDetailsId": null,
    "hash": null,
    "id": "943daefb-da0f-4d78-94fc-09700892dbb4",
    "createdAt": "2025-07-23T13:50:05.673Z",
    "updatedAt": "2025-07-23T13:50:05.673Z",
    "version": 1,
    "retryAttempts": 0,
    "nextRetryAttemptAt": "2025-07-23T13:50:05.673Z"
}
```
</details> <details> <summary><strong>400 Bad Request</strong><br>Ошибка валидации или некорректный статус объекта</summary>

```json
{
    "error": "Bad Request",
    "statusCode": 400
}
```
</details> <details> <summary><strong>500 Internal Server Error</strong><br>Непредвиденная ошибка сервера</summary>

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```