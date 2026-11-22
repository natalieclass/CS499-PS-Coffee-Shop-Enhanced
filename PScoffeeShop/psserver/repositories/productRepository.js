const pool = require('../config/db');

// Returns products keyed by SKU, in the shape the client already expects.
// unitPrice is DECIMAL(10,2) in the database and integer cents in the
// application; this is the one place that conversion happens.
async function findAllActive() {
  const [rows] = await pool.query(
    `SELECT p.sku, p.productName, p.unitPrice, p.sizeLabel,
            p.imageFile, c.categoryName
       FROM Product p
       JOIN ProductCategory c ON c.categoryID = p.categoryID
      WHERE p.isActive = 1
      ORDER BY p.productName`
  );

  const catalog = {};
  rows.forEach(function (r) {
    catalog[r.sku] = {
      name: r.productName,
      priceCents: Math.round(Number(r.unitPrice) * 100),
      size: r.sizeLabel,
      category: r.categoryName,
      image: '/psclient/images/DVG/' + r.imageFile,
      alt: r.productName
    };
  });
  return catalog;
}


// Look up the current price and ID for a set of SKUs. The browser never
// sends prices; this is where they come from.
async function findPricedBySkus(skus) {
  const [rows] = await pool.query(
    'SELECT productID, sku, unitPrice FROM Product WHERE isActive = 1 AND sku IN (?)',
    [skus]
  );
  return rows;
}

module.exports = { findAllActive, findPricedBySkus };