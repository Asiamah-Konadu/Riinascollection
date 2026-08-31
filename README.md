# Riina's Collections — shop with backend

A Next.js site with a Postgres database (via Prisma) behind it, so you can:

- Add, edit, hide, and delete products from a password-protected `/admin` panel — no code
  editing needed.
- Every customer order gets an order number, a receipt page, and is saved so you can look it
  up any time in `/admin/orders`.
- The shop page (`/`) is unchanged visually, but now reads products from the database
  instead of hard-coded HTML.

## 1. Install dependencies

```bash
npm install
```

## 2. Set up your database

You said you want **Prisma Postgres**, so:

1. Go to [console.prisma.io](https://console.prisma.io) (or, if deploying on Vercel, add the
   **Prisma Postgres** integration from your Vercel project's Storage tab — it does this for
   you automatically).
2. Create a new Prisma Postgres database and copy the connection string it gives you.

## 3. Configure environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env
```

- `DATABASE_URL` — the connection string from step 2.
- `ADMIN_PASSWORD` — the password you'll type in at `/admin/login`. Pick something only you
  know.
- `ADMIN_SECRET` — a random string used to sign the admin login cookie. Generate one with:
  ```bash
  openssl rand -hex 32
  ```
- `SHOP_WHATSAPP_NUMBER` — the WhatsApp number orders should be confirmed on (digits only,
  with country code, no `+` or spaces — e.g. `233599295013`).

## 4. Create the database tables

```bash
npx prisma db push
```

This reads `prisma/schema.prisma` and creates the `Product`, `Order`, and `OrderItem` tables
in your database.

## 5. (Optional) Add starter products

```bash
npm run db:seed
```

This adds 8 placeholder products so the shop isn't empty on first run — edit or delete them
from `/admin/products` once you're in.

## 6. Run it locally

```bash
npm run dev
```

- Shop: http://localhost:3000
- Admin: http://localhost:3000/admin/login

## 7. Deploy

This is a normal Next.js app, so it deploys to Vercel like any other:

1. Push this folder to a GitHub repo.
2. Import it in Vercel.
3. Add the same environment variables from your `.env` file in the Vercel project settings
   (Settings → Environment Variables).
4. Deploy. Vercel runs `prisma generate` automatically via the `postinstall` script.

After the first deploy, run `npx prisma db push` once (locally, pointed at your production
`DATABASE_URL`, or via Vercel's dashboard database tab) so the production database has its
tables.

## How it works

- **Products** live in the database. `/admin/products` lets you add a name, category, price,
  description, and a photo (uploaded photos are stored directly in the database as the site
  is small — no separate file storage needed).
- **Orders**: when a customer taps "Order this piece" on the shop, fills in their name, phone,
  and quantity, an order is created with an order number like `CB-00001`. They land on a
  receipt page they can screenshot or print, and a WhatsApp message is opened so they can send
  it to you to confirm.
- **Admin orders**: `/admin/orders` lists every order with its receipt, and lets you move it
  through `pending → confirmed → fulfilled`.
- **Login**: a single shared admin password (`ADMIN_PASSWORD`). No customer accounts — the
  shop still works exactly like before, just backed by a real database now.

## A couple of things worth knowing

- Order numbers are assigned by counting existing orders, which is simple but could in theory
  double up if two people order in the exact same instant. Fine for a shop this size; worth
  revisiting with a database sequence if order volume gets high.
- Product photos are capped at 4MB and stored as part of the product row. If your catalog
  grows into the hundreds of photos, moving to object storage (like Vercel Blob or
  Cloudinary) would be a worthwhile upgrade — happy to help with that later.
