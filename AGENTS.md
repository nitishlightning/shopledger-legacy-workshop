# ShopLedger

## Stack

Node.js with CommonJS, Express 4 and body-parser. The browser UI uses plain HTML, CSS and JavaScript. The app persists data in a local JSON file.

## Module map

- `server.js` serves the UI, mounts the API routers, and renders printable invoices.
- `public/` contains the bill desk, order history, khata and reporting UI.
- `routes/` contains the product, order, customer and report routers.
- `lib/orders.js` and `lib/dates.js` handle the order lifecycle, chronological sorting and date filtering.
- `lib/inventory.js` manages sellable stock and restores physical stock on cancellation. `lib/ledger.js` manages khata charges and settlements.
- `lib/pricing.js`, `lib/coupons.js` and `lib/tax.js` calculate checkout totals. `lib/invoice.js` shares the checkout calculation, and `lib/reports.js` compares invoice figures with stored totals.
- `lib/store.js` reads and writes the JSON data file.
- `test/` contains in-memory inventory, order history, settlement and invoice tests.
- `config.js` holds shop settings, coupons and GST rates. `data/db.json` holds app records.

## Commands

- `npm install` installs the declared runtime dependencies.
- `npm start` starts the app on port 3000 by default.
- `node --test` runs all tests. The `npm test` script is a placeholder.

## Change rules

- Write characterization tests with `node:test` before changing behavior. Pin what the code does today. Prefix tests for behavior that appears incorrect with `CURRENT BEHAVIOUR`.
- Change only the production module the ticket is about.
- Use in-memory fixtures in tests. Tests must never read or write `data/db.json`.
- Add no dependencies.
