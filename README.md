# whatsapp-mailing: automatic WhatsApp messages to Kaspi.kz customers

A backend that messages a seller's customers on WhatsApp after they order on
[Kaspi.kz](https://kaspi.kz): a thank-you note and a request to leave a review. Every hour it pulls
the seller's new orders from the Kaspi Shop API and sends each customer a personal message from the
seller's own WhatsApp number.

I built it in 2025 for sellers on Kaspi.

## How it works

```
every hour ──► MongoDB: registered sellers (WhatsApp number + Kaspi API token)
                 │
                 ├──► Kaspi Shop API: orders created this hour (Kaspi Delivery)
                 │      └──► customer name and phone
                 │
                 └──► WhatsApp Web session of that seller ──► "Hi {name}, thank you for your order!"
```

- **Sellers** (`src/sellers`): a seller registers with their WhatsApp number and Kaspi Shop API
  token, and sets a message template with a `{name}` placeholder. Custom messages can also be set
  per product code, e.g. care instructions for one product and a review request for another.
- **Orders** (`src/orders`): an hourly cron job fetches each seller's orders from the past hour,
  normalizes the customer's phone number and sends the seller's message. The manual "today's
  orders" run also supports per-product messages: it follows each order's entries to the product
  and picks that product's template.
- **WhatsApp** (`src/whatsapp`): one whatsapp-web.js client per seller (`LocalAuth` with the
  seller's number as the client ID), so many sellers send from their own numbers in one process.
  Sending retries up to 3 times.

## API

| Method | Path | What it does |
|---|---|---|
| POST | `/sellers/register` | Register a seller: `whatsappNumber`, `kaspiAuthToken` |
| PATCH | `/sellers/custom-message` | Set the seller's message template |
| PATCH | `/sellers/:whatsappNumber/set-custom` | Turn per-product messages on or off |
| POST / GET / DELETE | `/sellers/:whatsappNumber/products/:productCode` | Manage a product's message |
| GET | `/orders/today?whatsappNumber=` | The seller's orders for today |
| POST | `/orders/send-messages` | Message today's customers of one seller |
| POST | `/orders/send-messages-all` | The same for every seller |
| POST | `/orders/test-hourly-task` | Run the hourly job now |

## Stack

TypeScript · NestJS · @nestjs/schedule · whatsapp-web.js · MongoDB / Mongoose · Axios · Kaspi Shop API

## Running it

Requires Node.js 18+, a Kaspi seller's Shop API token and a WhatsApp account for the seller.

```bash
npm install
docker compose up -d mongo   # MongoDB on localhost:27017
cp .env.example .env
set -a; source .env; set +a  # load the settings into the shell
npm run start:dev            # http://localhost:3001
```

Register a seller, then send the first messages. The terminal shows a QR code: scan it in
WhatsApp → Linked devices on the seller's phone.

WhatsApp logins are stored locally in `.wwebjs_auth/`. That folder is git-ignored on purpose: it
gives access to the linked WhatsApp accounts.

## Author

**Ratmir Akimov**: [github.com/AkimovRatmir](https://github.com/AkimovRatmir)

## License

All rights reserved. The code is published for viewing only. See [LICENSE](LICENSE).
