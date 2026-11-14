const pool = require('../config/db');

// Look up one customer by email address.
// Returns the row if found, or undefined if nobody is registered with it.
async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT userID, email, password, firstName, lastName FROM Customer WHERE email = ?',
    [email]
  );
  return rows[0];
}

// Insert a new customer and return the generated userID.
async function insert(customer) {
  const [result] = await pool.query(
    `INSERT INTO Customer
       (email, firstName, lastName, password, custPhone, street, city, state, zipCode, country)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      customer.email,
      customer.firstName,
      customer.lastName,
      customer.password,
      customer.custPhone,
      customer.street,
      customer.city,
      customer.state,
      customer.zipCode,
      customer.country
    ]
  );
  return result.insertId;
}

async function findById(userID) {
  const [rows] = await pool.query(
    'SELECT * FROM Customer WHERE userID = ?',
    [userID]
  );
  return rows[0];
}

async function update(userID, customer) {
  const [result] = await pool.query(
    `UPDATE Customer
        SET email = ?, firstName = ?, lastName = ?, password = ?, custPhone = ?,
            street = ?, city = ?, state = ?, zipCode = ?, country = ?
      WHERE userID = ?`,
    [customer.email, customer.firstName, customer.lastName, customer.password,
     customer.custPhone, customer.street, customer.city, customer.state,
     customer.zipCode, customer.country, userID]
  );
  return result.affectedRows;
}

module.exports = { findByEmail, findById, insert, update };