# P.S. Coffee Shop

A website for a coffee shop, showcasing its products and services. Originally built
for a friend, Shannon.

## About

Customers can create an account, sign in, browse syrups and sauces for purchase,
edit member information, and submit feedback. This application was originally built
at Brookdale Community College in 2022 and enhanced for CS 499 at SNHU in 2026.

## Tech Stack

- **Front end:** HTML, CSS, JavaScript, jQuery
- **Back end:** Node.js, Express
- **Database:** MySQL 8, accessed with the mysql2 driver
- **Testing:** Jest
- **Other:** bcrypt for password hashing, express-validator for input validation,
  dotenv for configuration

## Getting Started

### Prerequisites

Node.js 18 or later and MySQL 8.0 or later must be installed and running. MySQL
Workbench is recommended for running the schema scripts, though any MySQL client
will work.

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
| `DB_USER` | MySQL account the application connects as |
| `DB_PASSWORD` | Password for that account |
| `DB_NAME` | Database name, `mydb` by default |
| `PORT` | Port the server listens on, `6363` by default |
| `CLIENT_ORIGIN` | Origin permitted by CORS |

### Database Setup

Run `ForwardEngineerPSCSIIFINAL.sql` to create the `mydb` schema and its tables.

On MySQL 8.0.16 and later the script fails partway through with
`Failed to add the foreign key constraint. Missing unique key for constraint`.
This happens because the `Pay` table references `Employee(employeeID)`, but
`Employee` uses a composite primary key of `(employeeID, password)`, and newer
versions of MySQL require the referenced column to have a unique constraint of its
own. Add the index first, then re-run the script:

```sql
ALTER TABLE mydb.Employee ADD UNIQUE INDEX uq_employeeID (employeeID);
```

The composite key is addressed in the planned database enhancement.

`FINALIIwebscript.sql` contains sample data. Note that its first two lines drop the
database and then attempt to use it, so the statements must be run individually.

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
│   └── contactRoutes.js
├── controllers/
│   ├── customerController.js    Translates between HTTP and the application
│   └── contactController.js
├── services/
│   ├── customerService.js       Business rules; no SQL and no HTTP
│   └── contactService.js
├── repositories/
│   ├── customerRepository.js    The only files containing SQL
│   └── contactRepository.js
├── middleware/
│   ├── validate.js              Rejects invalid input before it reaches the database
│   └── errorHandler.js          Converts thrown errors into HTTP status codes
├── tests/
│   ├── customerService.test.js
│   └── contactService.test.js
├── psapp.js                     Application setup and startup
└── psrouter.js                  Static page routes
```
psclient/
├── js/
│   ├── catalog.js               Product data keyed by SKU, prices in integer cents
│   ├── cart.js                  Cart state and money arithmetic; no DOM, no jQuery
│   ├── productQuery.js          Category filtering, search and sorting
│   └── SyrupsSauces.js          Renders the shop page from the catalog
└── tests/
    ├── cart.test.js
    └── productQuery.test.js

Each layer has one responsibility. Routes know URLs, controllers know HTTP,
services know the business rules, and repositories know SQL. A layer only talks to
the one directly below it.

## Architecture

A request travels down through the layers and a response travels back up. A new
account arrives at a route, which validates the submitted fields and rejects the
request with a 400 if anything is wrong. The controller reads the request body and
passes a clean object to the service. The service applies the business rules: it
checks whether the email is already registered and throws a 409 if so, then hashes
the password with bcrypt before anything is stored. The repository runs a
parameterized INSERT through the connection pool. If any layer throws, the error
travels up to a single middleware that returns the appropriate status code.

The separation matters because each concern can now change independently. Swapping
the database means editing the repositories. Changing a business rule means editing
a service. And the business rules can be tested without a database, because no SQL
exists above the repository layer.

## Testing

```
npm test
```

Twenty-one unit tests across four suites, none of which need a database or a browser.

- `psserver/tests/customerService.test.js` — registration rejects a duplicate email with a 409 and performs no insert, the password reaching the database is a bcrypt hash rather than the plaintext the user typed, and sign-in rejects both an unknown email and an incorrect password with a 401.
- `psserver/tests/contactService.test.js` — feedback is stored, and repository errors propagate to the caller rather than being swallowed.
- `psclient/tests/cart.test.js` — the subtotal is correct with multiple items, changing a quantity replaces the old line total instead of adding to it, a quantity of zero removes the item, an empty cart is not charged shipping, and invalid or out-of-range quantities are rejected.
- `psclient/tests/productQuery.test.js` — category filtering, case-insensitive search with whitespace trimming, the three sort orders, and that sorting never modifies the array it is given.

The repository layer is mocked for the service tests. The cart and query modules have no DOM dependencies at all, so they run directly in Node. None of this was possible before the enhancements, when the same function handled the HTTP request, the business logic and the SQL query, and the cart logic was tangled into inline event handlers.

## CS 499 Enhancements

### Software Design and Engineering

The original back end was a single 122-line module that opened the database
connection, defined all five API endpoints, and wrote every SQL query. This
enhancement restructured it:

- **Layered architecture** — routes define URLs, controllers handle HTTP,
  services hold business rules, and repositories contain the only SQL in the
  application.
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
  appropriate, replacing five copies of a block that returned 201 on both success
  and failure.
- **Consolidated page routing** — nine repeated route blocks became one loop over a
  route table, a dead `/Cart` route was removed, and three unreachable pages were
  given routes.
- **Debug logging removed** — including statements that printed user passwords to
  the server console and the browser console.
- **Unit tests added** — six tests covering the service layer, runnable without a
  database.

### Algorithms and Data Structures

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
would be worth its complexity once the database enhancement makes the catalog large
enough to need prefix search.

### Databases

Planned: consolidating the duplicate product tables into a single `Product` table
with categories, adding the missing `CustomerOrder` and `OrderItem` tables,
correcting primary keys and column types, adding indexes, implementing order
placement as a transaction, and writing aggregate reporting queries.

## Author

Natalie Class
CS 499 Computer Science Capstone, Southern New Hampshire University
CS-499-13677-M01