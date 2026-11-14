const pool = require('../config/db');

async function insert(contact) {
  await pool.query(
    'INSERT INTO Contact (fullName, phone, email, feedback) VALUES (?, ?, ?, ?)',
    [contact.fullName, contact.phone, contact.email, contact.feedback]
  );
}

module.exports = { insert };