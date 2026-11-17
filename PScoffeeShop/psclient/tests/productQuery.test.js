const pq = require('../js/productQuery.js');
const CATALOG = require('../js/catalog.js');

const names = (skus) => skus.map((s) => CATALOG[s].name);
const prices = (skus) => skus.map((s) => CATALOG[s].priceCents);


test('skusInCategory returns only products in that category', () => {
  expect(pq.skusInCategory('syrup')).toHaveLength(5);
  expect(pq.skusInCategory('sauce')).toHaveLength(3);
  pq.skusInCategory('sauce').forEach((sku) => {
    expect(CATALOG[sku].category).toBe('sauce');
  });
});


test('an unrecognized category returns every product', () => {
  expect(pq.skusInCategory('beans')).toHaveLength(8);
});


test('sortSkus does not modify the array it is given', () => {
  const original = ['DVG-STRAWBERRY', 'DVG-CARAMEL'];
  const before = original.slice();

  pq.sortSkus(original, 'price-desc');

  expect(original).toEqual(before);
});


test('price-asc puts the cheapest product first', () => {
  const result = pq.queryCatalog('syrup', '', 'price-asc');

  expect(prices(result)).toEqual([545, 632, 678, 721, 765]);
});


test('price-desc puts the most expensive product first', () => {
  // same, reversed
  const result = pq.queryCatalog('syrup', '', 'price-desc');
  
  expect(prices(result)).toEqual([765, 721, 678, 632, 545]);
});


test('search is case-insensitive and ignores surrounding spaces', () => {
  const upper = pq.queryCatalog('sauce', 'CHOC', 'name');
  const padded = pq.queryCatalog('sauce', '  choc  ', 'name'); //spacing to test trimming works

  expect(names(upper)).toEqual(['DVG Chocolate Sauce', 'DVG White Chocolate Sauce']);
  expect(names(padded)).toEqual(['DVG Chocolate Sauce', 'DVG White Chocolate Sauce']); //proves trimming works
});


test('a search with no matches returns an empty array', () => {
  const result = pq.queryCatalog('syrup', 'xyz', 'name');
  expect(pq.queryCatalog('sauce', 'xyz', 'name')).toEqual([]);
  expect(result).toEqual([]);
});


test('an empty search term returns everything in the category', () => {
  expect(pq.queryCatalog('syrup', '', 'name')).toHaveLength(5);
  expect(pq.queryCatalog('sauce', '', 'name')).toHaveLength(3);
});