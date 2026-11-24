# P.S. Coffee Shop

A website for a coffee shop, showcasing its products and services. Originally built
for a friend, Shannon.

## About

Customers can create an account, sign in, browse syrups and sauces, add them to a
cart, place an order, edit member information, and submit feedback. This application
was originally built at Brookdale Community College in 2022 and enhanced for CS 499
at SNHU in 2026.

## Tech Stack

- **Front end:** HTML, CSS, JavaScript, jQuery
- **Back end:** Node.js, Express
- **Database:** MySQL 8, accessed with the mysql2 driver
- **Testing:** Jest
- **Other:** bcrypt for password hashing, express-validator for input validation,
  dotenv for configuration

## Getting Started

### Prerequisites

Node.js 18 or later and MySQL 8.0 or later must be installed and running. Any MySQL
client will work for running the setup scripts.

### Installation

```
git clone https://github.com/natalieclass/CS499-PS-Coffee-Shop-Enhanced.git
cd CS499-PS-Coffee-Shop-Enhanced/PScoffeeShop
npm install
```

### Environment Variables

The application reads its configuration from a `.env` file, which is not committed
to this repository. Copy `.env.example` to `.env` and fill in your own values:

```
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `DB_HOST` | Hostname of the MySQL server, usually `localhost` |
| `DB_USER` | MySQL account the application connects as, `pscoffee_app` |
| `DB_PASSWORD` | Password for that account |
| `DB_NAME` | Database name, `mydb` by default |
| `PORT` | Port the server listens on, `6363` by default |
| `CLIENT_ORIGIN` | Origin permitted by CORS |

### Database Setup

The scripts in `PScoffeeShop/sql/` rebuild the database from scratch. Run them in
order:

```
mysql -u root -p < sql/01_schema.sql     # tables, keys, indexes
mysql -u root -p < sql/02_data.sql       # products, customers, sample orders
mysql -u root -p < sql/03_views.sql      # reporting views
mysql -u root -p < sql/04_app_user.sql   # limited-privilege application account
```

`01_schema.sql` drops and recreates the `mydb` schema, so re-running it starts
clean. Because `04_app_user.sql` grants privileges on specific tables, it has to be
re-run after any rebuild.

Before running `04_app_user.sql`, replace `CHANGE_THIS_PASSWORD` with a password of
your own and put the same value in `.env` as `DB_PASSWORD`. The application connects
as `pscoffee_app`, which holds only the privileges the code uses — no DELETE, no
DROP, and no access at all to the Employee, Pay, EmployeeOrder or Supplier tables.

The sample customers all use the password `Password123`.

#### The original scripts

`ForwardEngineerPSCSIIFINAL.sql` and `FINALIIwebscript.sql` are the 2022 originals,
kept for comparison. Neither runs start to finish:

- The forward-engineering script fails on MySQL 8.0.16 and later with
  `Failed to add the foreign key constraint. Missing unique key for constraint`,
  because `Pay` references `Employee(employeeID)` while `Employee`'s primary key is
  `(employeeID, password)`.
- `FINALIIwebscript.sql` drops the database on its first line and then attempts to
  use it on the second, so its statements have to be run individually.

`FINALIIEERDiagramPS.mwb` is the original Workbench model. MySQL Workbench 26 removed
the modeling feature and cannot open it, so both diagrams in this repository were
regenerated from the SQL instead.

### Running the Application

```
node psserver/psapp.js
```

Then open `http://localhost:6363` in a browser.

## Project Structure

```
psserver/
├── config/
│   └── db.js                    Connection pool, configured from environment variables
├── routes/
│   ├── customerRoutes.js        URL definitions and validation rules
│   ├── contactRoutes.js
│   ├── productRoutes.js         GET /api/products
│   └── orderRoutes.js           POST /api/orders
├── controllers/
│   ├── customerController.js    Translates between HTTP and the application
│   ├── contactController.js
│   ├── productController.js
│   └── orderController.js
├── services/
│   ├── customerService.js       Business rules; no SQL and no HTTP
│   ├── contactService.js
│   ├── productService.js
│   └── orderService.js          Looks up prices and recomputes totals server-side
├── repositories/
│   ├── customerRepository.js    The only files containing SQL
│   ├── contactRepository.js
│   ├── productRepository.js     Catalog queries; converts DECIMAL to integer cents
│   └── orderRepository.js       Order insertion inside a transaction
├── middleware/
│   ├── validate.js              Rejects invalid input before it reaches the database
│   └── errorHandler.js          Converts thrown errors into HTTP status codes
├── tests/
│   ├── customerService.test.js
│   ├── contactService.test.js
│   └── orderService.test.js
├── psapp.js                     Application setup and startup
└── psrouter.js                  Static page routes

psclient/
├── js/
│   ├── catalog.js               Test fixture only; the live catalog comes from the database
│   ├── cart.js                  Cart state and money arithmetic; no DOM, no jQuery
│   ├── productQuery.js          Category filtering, search and sorting
│   └── SyrupsSauces.js          Renders the shop page
└── tests/
    ├── cart.test.js
    └── productQuery.test.js

sql/
├── 01_schema.sql                Tables, keys, constraints and indexes
├── 02_data.sql                  Categories, supplier, products, sample customers and orders
├── 03_views.sql                 Reporting views
└── 04_app_user.sql              Limited-privilege application account
```

Each layer has one responsibility. Routes know URLs, controllers know HTTP, services
know the business rules, and repositories know SQL. A layer only talks to the one
directly below it.

## Architecture

A request travels down through the layers and a response travels back up. A new
account arrives at a route, which validates the submitted fields and rejects the
request with a 400 if anything is wrong. The controller reads the request body and
passes a clean object to the service. The service applies the business rules: it
checks whether the email is already registered and throws a 409 if so, then hashes
the password with bcrypt before anything is stored. The repository runs a
parameterized INSERT through the connection pool. If any layer throws, the error
travels up to a single middleware that returns the appropriate status code.

Placing an order follows the same path with two additions. The browser sends only
SKUs and quantities — never prices — and the service looks each price up in the
`Product` table and recomputes the subtotal, tax and total itself, so a request
claiming a product costs one cent is still charged in full. The repository then
checks a single connection out of the pool and writes the order and all of its line
items inside one transaction, which commits together or rolls back together.

The separation matters because each concern can now change independently. Swapping
the database means editing the repositories. Changing a business rule means editing
a service. And the business rules can be tested without a database, because no SQL
exists above the repository layer.

## Testing

```
npm test
```

Twenty-eight unit tests across five suites, none of which need a database or a
browser.

- `psserver/tests/customerService.test.js` — registration rejects a duplicate email
  with a 409 and performs no insert, the password reaching the database is a bcrypt
  hash rather than the plaintext the user typed, and sign-in rejects both an unknown
  email and an incorrect password with a 401.
- `psserver/tests/contactService.test.js` — feedback is stored, and repository errors
  propagate to the caller rather than being swallowed.
- `psserver/tests/orderService.test.js` — the price used is the one from the database
  and not one supplied by the client, totals are computed correctly across multiple
  items, and an empty cart, an unknown product or an invalid quantity are each
  rejected without anything being saved.
- `psclient/tests/cart.test.js` — the subtotal is correct with multiple items,
  changing a quantity replaces the old line total instead of adding to it, a quantity
  of zero removes the item, an empty cart is not charged shipping, and invalid or
  out-of-range quantities are rejected.
- `psclient/tests/productQuery.test.js` — category filtering, case-insensitive search
  with whitespace trimming, the three sort orders, and that sorting never modifies the
  array it is given.

The repository layer is mocked for the service tests. The cart and query modules have
no DOM dependencies at all, so they run directly in Node. None of this was possible
before the enhancements, when the same function handled the HTTP request, the business
logic and the SQL query, and the cart logic was tangled into inline event handlers.

## CS 499 Enhancements

### Software Design and Engineering

The original back end was a single 122-line module that opened the database
connection, defined all five API endpoints, and wrote every SQL query. This
enhancement restructured it:

- **Layered architecture** — routes define URLs, controllers handle HTTP, services
  hold business rules, and repositories contain the only SQL in the application.
- **Credentials moved to environment variables** — the database host, user and
  password were hard-coded in a file committed to a public repository.
- **Passwords hashed with bcrypt** — previously stored as plain text and matched
  directly in a SQL `WHERE` clause.
- **Sign-in changed from GET to POST** — credentials no longer travel in the URL,
  browser history, or server logs.
- **mysql2 with a connection pool** — replaced an unmaintained driver and a single
  connection that was never closed, and moved from nested callbacks to async/await.
- **Input validation** — request data is now checked before it reaches the database.
- **Centralized error handling** — one middleware returns 400, 409 or 500 as
  appropriate, replacing five copies of a block that returned 201 on both success and
  failure.
- **Consolidated page routing** — nine repeated route blocks became one loop over a
  route table, a dead `/Cart` route was removed, and three unreachable pages were
  given routes.
- **Debug logging removed** — including statements that printed user passwords to the
  server console and the browser console.
- **Unit tests added** — six tests covering the service layer, runnable without a
  database.

### Algorithms and Data Structures

The shopping cart was a fixed eight-element array indexed by position, with prices
hardcoded in the HTML as arguments to inline event handlers. Line totals were stored
as strings produced by `.toFixed(2)`, and the subtotal loop combined them with `+`,
which concatenates strings rather than adding numbers. With two items selected the
page reported a subtotal of $6.33 instead of $13.97, and a grand total of $21.77
instead of $29.95 — the shop undercharged on every multi-item order.

- **Product catalog keyed by SKU** — product data moved out of the HTML into one
  object. Lookup is O(1), and adding a product is a single entry rather than an HTML
  edit plus an array resize plus a renumbering of indexes.
- **Cart as a hash map** — replaced the fixed array indexed 0 through 7. Items not in
  the cart are absent rather than zero placeholders.
- **Integer cents throughout** — every value is a whole number of cents until display,
  which removes the string concatenation and the floating-point rounding in one change.
- **Running subtotal** — maintained incrementally by subtracting the old line total and
  adding the new one, O(1) per change, replacing a full loop on every keystroke.
- **Search and sort** — case-insensitive substring search over product names, and
  sorting by name, price ascending or price descending, in a module with no knowledge
  of the cart or the DOM.
- **Rows generated from the catalog** — the page is rebuilt on every search or sort,
  with the cart as the source of truth, so quantities survive a re-render.
- **Shipping on an empty cart** — previously a flat $15 was charged whether or not
  anything was selected.

Search is a linear scan, which is the correct choice at this catalog size. A trie
answers prefix queries, and the search customers need is a substring match — every
product name begins with "DVG," so a prefix trie would only ever match on that.

### Databases

The original schema had nine tables, of which the application used two. There was no
way to record a purchase — the checkout button displayed an alert and nothing was
stored. `Milk`, `Merchandise` and `CartLineItem` were three attempts at the same idea,
and the first two had no product name column. Money columns were declared as bare
`DECIMAL`, which MySQL reads as `DECIMAL(10,0)`, so $7.65 would have been stored as 8.

- **Product and ProductCategory** — `CartLineItem` was always a product catalog rather
  than a cart, so it became `Product`, with `Milk` and `Merchandise` folded in and
  their distinction expressed as a category row.
- **CustomerOrder and OrderItem** — the tables the schema was missing. `OrderItem`
  stores the price at the time of purchase, so a later price change does not rewrite
  what past customers paid.
- **Keys and types corrected** — the password removed from the `Employee` primary key,
  surrogate keys on `Contact` and `Pay`, `zipCode` changed from `INT` to `VARCHAR` so
  leading zeros survive, a unique constraint on customer email, and every money column
  declared `DECIMAL(10,2)`.
- **Indexes** on customer email, order date, product name and category.
- **The catalog is served from the database** — `GET /api/products` replaced the
  hardcoded product data in the client, and the file that held it now exists only as a
  test fixture.
- **Order placement runs in a transaction** — the order and all its line items commit
  together or roll back together, so a failure part way through leaves no partial order.
- **Prices and totals are computed on the server.** The browser sends SKUs and
  quantities only. A request claiming a product costs one cent is priced from the
  database and charged in full.
- **Reporting views** — revenue by category, best-selling products, revenue by supplier
  and monthly sales, using joins, grouping and aggregation the original database could
  not support.
- **A limited-privilege database account** — the application no longer connects as root.
  `pscoffee_app` has only SELECT, INSERT and UPDATE on the tables the code touches, and
  cannot drop a table or read the payroll tables at all.

`EERDiagram_Original.png` and `EERDiagram_Enhanced.png` show the schema before and
after. In the original, `Customer` has no relationships at all.

## Author

Natalie Class
CS 499 Computer Science Capstone, Southern New Hampshire University
CS-499-13677-M01