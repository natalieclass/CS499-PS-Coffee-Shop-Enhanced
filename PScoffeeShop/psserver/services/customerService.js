const bcrypt = require('bcrypt');
const customerRepository = require('../repositories/customerRepository');


//the salt is random data bcrypt mixed into the password before hashing
//rounds are the cost factor, and it's an exponent, not a count.10 means 1024 iterations
const SALT_ROUNDS = 10; 

async function register(input) {
  // Business rule: one account per email address.
  const existing = await customerRepository.findByEmail(input.email);
  if (existing) {
    const err = new Error('An account with that email already exists');
    err.status = 409;
    throw err;
  }

  // Never store the password as typed.
  const hashed = await bcrypt.hash(input.password, SALT_ROUNDS);

  const userID = await customerRepository.insert({
    ...input,
    password: hashed
  });

  return { userID, email: input.email };
}

module.exports = { register };