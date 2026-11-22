const productService = require('../services/productService');

async function getProducts(req, res, next) {
  try {
    const catalog = await productService.getCatalog();
    res.status(200).json(catalog);
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts };