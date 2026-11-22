const productRepository = require('../repositories/productRepository');

// No business rules yet. The layer exists so that when one arrives —
// hiding out-of-stock items, applying a sale price — it has a home
// that is neither the SQL nor the HTTP handler.
async function getCatalog() {
  return await productRepository.findAllActive();
}

module.exports = { getCatalog };