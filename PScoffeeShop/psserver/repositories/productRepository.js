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

module.exports = { findAllActive };