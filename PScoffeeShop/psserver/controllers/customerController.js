const customerService = require('../services/customerService');

async function createAccount(req, res, next) {
  try {
    //await lets asynchronous steps run in order 
    const customer = await customerService.register({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
      custPhone: req.body.phone,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      country: req.body.country
    });

    res.status(201).json({ userID: customer.userID });
  } catch (err) {
    next(err);
  }
}


async function signIn(req, res, next) {
  try {
    //await lets asynchronous steps run in order 
    const customer = await customerService.login({
      email: req.body.email,
      password: req.body.password
    });

    res.status(200).json({ userID: customer.userID });
  } catch (err) {
    next(err);
  }
}

module.exports = { createAccount, signIn };