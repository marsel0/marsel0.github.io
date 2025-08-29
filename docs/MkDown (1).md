Для получения актуального статуса ордера используйте метод Get order

https://demo.tapbank.net/public/api/v1/shop/orders/{id}

При ручном тестировании через postman можно периодически вызывать данный метод пока статус не меняется с requisites на customer_confirm (или cancelled в случае отмены) и ордера появился объект requisites как в примере ниже
{
  "id": "763aab38-6fa9-4e95-bfed-a594b12314b6",
  "amount": 1000,
  "currency": "RUB",
  "status": "customer_confirm",
  "statusDetails": null,
  "statusTimeoutAt": "2024-02-09T15:13:00.0002",
  "requisites": {
    "phone": null,
    "cardInfo": "111212111111112",
    "bank": "sberbank"
  }
}
При интеграции в вашей системе, можно использовать технику polling, при котором статус ордера периодически опрашивается, до тех пор пока статус ордера не поменяется.
Пример polling код-а на JS с проверкой статуса:
// assuming order is in status requisites
while (order.status === 'requisites') {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      order = await request(
        {
          method: 'get',
          url: `${apiPrefix}/shop/orders/${order.id}`,
          headers: headers,
        }
      );
    }
После того как реквизиты для оплаты будут получены, их необходимо отобразить клиенту, чтобы клиент перевел денежные средства на них.
Есть три вида ответа: 200,401,404
Ответ 200 это успешный ответ
{
  "id": "string",
  "initialAmount": 0,
  "amount": 0,
  "currency": "string",
  "status": "new",
  "statusDetails": "no_payment",
  "statusTimeoutAt": "string",
  "requisites": {
    "countryCode": "string",
    "countryNameEn": "string",
    "phone": "string",
    "cardInfo": "string",
    "bank": "string",
    "bankName": "string",
    "sameBank": true,
    "cardholder": "string",
    "swiftBic": "string",
    "bic": "string",
    "email": "string",
    "idCard": "string",
    "beneficiaryName": "string",
    "accountNumber": "string",
    "taxId": "string",
    "expirationDate": "string",
    "sberPayUrl": "string",
    "paymentLink": "string"
  },
  "shop": {
    "name": "string",
    "customerDataCollectionOrder": "before_payment",
    "collectCustomerReceipts": true
  },
  "payment": {
    "type": "card2card",
    "bank": "sberbank",
    "customerCardFirstDigits": "string",
    "customerCardLastDigits": "string",
    "customerBank": "string",
    "customerName": "string",
    "customerPhoneLastDigits": "string",
    "customerUtr": "string",
    "customerIBAN": "string",
    "customerAccountNumber": "string"
  },
  "customer": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "ip": "string",
    "fingerprint": "string"
  },
  "assetCurrencyAmount": 0,
  "shopAmount": 0,
  "shopFee": 0,
  "currencyRate": 0,
  "integration": {
    "callbackUrlStatus": "in_progress",
    "link": "string",
    "token": "string",
    "callbackUrl": "string",
    "callbackMethod": "get",
    "externalOrderId": "string"
  }
}
Ответ 401 гласит об отсуствии авторизации
{
"statusCode": 401,
"message": "Unauthorized"
}
Ответ 404 о ненайдено
{
  "statusCode": 404,
  "message": "Not Found"
}

