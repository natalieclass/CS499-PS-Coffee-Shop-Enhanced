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


async function login(input) {
  const customer = await customerRepository.findByEmail(input.email);

  // One error object for both failure paths, deliberately.
  const invalid = new Error('Invalid email or password');
  invalid.status = 401;

  if (!customer) {
    throw invalid;
  }

  const matches = await bcrypt.compare(input.password, customer.password);
  if (!matches) {
    throw invalid;
  }

  return { userID: customer.userID, email: customer.email };
}

async function findMember(userID) {
  const customer = await customerRepository.findById(userID);
  if (!customer) {
    const err = new Error('Member not found');
    err.status = 404;
    throw err;
  }

  const { password, ...safe } = customer;
  return safe;
}

async function updateMember(userID, input) {
  const existing = await customerRepository.findById(userID);
  if (!existing) {
    const err = new Error('Member not found');
    err.status = 404;
    throw err;
  }

  const password = input.password
    ? await bcrypt.hash(input.password, SALT_ROUNDS)
    : existing.password;

  await customerRepository.update(userID, { ...input, password });
}

module.exports = { register, login, findMember, updateMember  };