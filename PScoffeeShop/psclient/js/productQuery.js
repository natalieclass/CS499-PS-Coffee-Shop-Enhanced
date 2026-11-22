let QUERY_CATALOG = (typeof module !== 'undefined')
  ? require('./catalog.js')
  : {};

function setQueryCatalog(data) {
  QUERY_CATALOG = data;
}


// Return all skus in one category, unsorted and unfiltered.
// category 'syrup' or 'sauce'; any other value returns every sku.
function skusInCategory(category) {
  const all = Object.keys(QUERY_CATALOG);

  if (category !== 'syrup' && category !== 'sauce') {
    return all;
  }

  return all.filter(function (sku) {
    return QUERY_CATALOG[sku].category === category;
  });
}


// Case-insensitive substring match of term against the product's name.
// An empty or whitespace-only term matches everything.
function matchesSearch(sku, term) {
  if (!term || !term.trim()) return true;
  const name = QUERY_CATALOG[sku].name.toLowerCase();
  return name.includes(term.trim().toLowerCase());
}


// Filter an array of skus down to the ones matching term.
// term is whatever the user types into the search bar
function searchSkus(skus, term) {
  return skus.filter(function (sku) {
    return matchesSearch(sku, term);
  });
}

// Return a NEW sorted array. Must not modify the array passed in.
// sortBy: 'name'       -> product name, A to Z
//         'price-asc'  -> cheapest first
//         'price-desc' -> most expensive first
//         anything else -> original order
function sortSkus(skus, sortBy) {
  const copy = skus.slice();

  if (sortBy === 'name') {
    return copy.sort(function (a, b) {
      return QUERY_CATALOG[a].name.localeCompare(QUERY_CATALOG[b].name);
    });
  }

  if (sortBy === 'price-asc') {
    return copy.sort(function (a, b) {
      return QUERY_CATALOG[a].priceCents - QUERY_CATALOG[b].priceCents;
    });
  }

  if (sortBy === 'price-desc') {
    return copy.sort(function (a, b) {
      return QUERY_CATALOG[b].priceCents - QUERY_CATALOG[a].priceCents;
    });
  }

  return copy;
}

// Composes the three: category, then search, then sort.
function queryCatalog(category, term, sortBy) {
    return sortSkus(searchSkus(skusInCategory(category), term), sortBy);
}


if (typeof module !== 'undefined') {
  module.exports = { skusInCategory, matchesSearch, searchSkus, sortSkus, queryCatalog };
}
