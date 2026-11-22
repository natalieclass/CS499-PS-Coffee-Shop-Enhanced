let CATALOG = {};
// Build the <td> markup for one product.
// Reads the current quantity from the cart so a re-render (search, sort)
// does not wipe out what the user already entered.
function productCell(sku) {
  const p = CATALOG[sku];
  const qty = getQuantity(sku);
  const qtyValue = qty > 0 ? ' value="' + qty + '"' : '';
  const totalText = qty > 0
    ? 'Total for Item(s): ' + formatCents(lineTotalCents(sku))
    : '';

  return '<td>' +
    '<div class="productDes" align="center">' +
      '<img src="' + p.image + '" alt="' + p.alt + '" width="178" height="220"/>' +
      '<div><label style="font-size:15px" class="product"><b>' + p.name + '</b></label></div>' +
      '<h4 class="price">Price: $' + formatCents(p.priceCents) + '</h4>' +
      '<h4 class="ounces">' + p.size + '</h4>' +
      '<h4 class="quantity">Quantity: ' +
        '<input type="number" size="5" min="0" max="10" ' +
               'id="qty-' + sku + '" data-sku="' + sku + '"' + qtyValue + '>' +
      '</h4>' +
      '<p style="font-weight:bold" id="total-' + sku + '">' + totalText + '</p>' +
    '</div>' +
  '</td>';
}


// Write the four totals into the page.
function renderTotals() {
  $('#subt').html(formatCents(getSubtotalCents()));
  $('#taxr').html(formatCents(taxCents()));
  $('#shipr').html(formatCents(shippingCents()));
  $('#grandt').html(formatCents(grandTotalCents()));
}


// Rebuild both product rows from the catalog, filtered by the search box and
// ordered by the sort dropdown. Each category is queried separately so the
// syrups and sauces tables stay independent.
function renderCatalog() {
  const term = $('#searchBox').val();
  const sortBy = $('#sortSelect').val();

  $('#syrupsRow').empty();
  $('#saucesRow').empty();

  queryCatalog('syrup', term, sortBy).forEach(function (sku) {
    $('#syrupsRow').append(productCell(sku));
  });

  queryCatalog('sauce', term, sortBy).forEach(function (sku) {
    $('#saucesRow').append(productCell(sku));
  });

  renderTotals();
}


// Read the value out of '#qty-' + sku, hand it to setQuantity, then update
// that product's own '#total-' + sku line, then refresh the order totals.
function onQuantityChange(sku) {
  const qty = $('#qty-' + sku).val();
  setQuantity(sku, qty);
  $('#total-' + sku).html('Total for Item(s): ' + formatCents(lineTotalCents(sku)));
  renderTotals();
}


function Checkout() {
  alert("You have successfully selected items for checkout! At this time we are not processing any orders.");
  location.assign("http://localhost:6363" + "/PSDashboard");
}


// Delegated handlers, registered once. These must stay outside any function
// that runs repeatedly — jQuery's .on() adds a handler rather than replacing
// one, so registering inside a render function would stack duplicates.
$(document).on('input', 'input[data-sku]', function () {
  onQuantityChange($(this).data('sku'));
});

$(document).on('input', '#searchBox', renderCatalog);
$(document).on('change', '#sortSelect', renderCatalog);

fetch('/api/products')
  .then(function (response) {
    if (!response.ok) throw new Error('Could not load products');
    return response.json();
  })
  .then(function (catalog) {
    CATALOG = catalog;
    setCartCatalog(catalog);
    setQueryCatalog(catalog);
    renderCatalog();
  })
  .catch(function (err) {
    $('#syrupsRow').html('<td>Products could not be loaded right now.</td>');
    console.error(err);
  });