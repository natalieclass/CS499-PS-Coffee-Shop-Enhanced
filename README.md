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

Six unit tests cover the service layer. They verify that registration rejects a
duplicate email with a 409 and performs no insert, that the password reaching the
database is a bcrypt hash rather than the plaintext the user typed, that sign-in
rejects both an unknown email and an incorrect password with a 401, and that
repository errors propagate to the caller rather than being swallowed.

The tests run without a database. The repository layer is replaced with mocks, so
the business rules are exercised in isolation. This was not possible before the
enhancement, when the same function handled the HTTP request, the business logic
and the SQL query.

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

Planned: replacing the shopping cart's fixed array with a hash map keyed by SKU,
maintaining a running subtotal instead of recalculating every line on each change,
performing currency arithmetic in integer cents, and adding trie-based product
search with sorting and filtering.

### Databases

Planned: consolidating the duplicate product tables into a single `Product` table
with categories, adding the missing `CustomerOrder` and `OrderItem` tables,
correcting primary keys and column types, adding indexes, implementing order
placement as a transaction, and writing aggregate reporting queries.

## Author

Natalie Class
CS 499 Computer Science Capstone, Southern New Hampshire University
CS-499-13677-M01