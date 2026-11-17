// Build the <td> markup for one product.
function productCell(sku) {
  const p = CATALOG[sku];
  return '<td>' +
    '<div class="productDes" align="center">' +
      '<img src="' + p.image + '" alt="' + p.alt + '" width="178" height="220"/>' +
      '<div><label style="font-size:15px" class="product"><b>' + p.name + '</b></label></div>' +
      '<h4 class="price">Price: $' + formatCents(p.priceCents) + '</h4>' +
      '<h4 class="ounces">' + p.size + '</h4>' +
      '<h4 class="quantity">Quantity: ' +
        '<input type="number" size="5" min="0" max="10" ' +
               'id="qty-' + sku + '" data-sku="' + sku + '">' +
      '</h4>' +
      '<p style="font-weight:bold" id="total-' + sku + '"></p>' +
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


// Loop every sku in CATALOG. Append productCell(sku) to '#syrupsRow' when the
// product's category is 'syrup', otherwise to '#saucesRow'. Call renderTotals()
// at the end so the page starts at 0.00 instead of blank.
function renderCatalog() {
  Object.keys(CATALOG).forEach(function (sku) {
    if (CATALOG[sku].category === 'syrup') {
      $('#syrupsRow').append(productCell(sku));
    } else {
      $('#saucesRow').append(productCell(sku));
    }
  });
  renderTotals();
}


// Read the value out of '#qty-' + sku, hand it to setQuantity, then update
// that product's own '#total-' + sku line, then call renderTotals().
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


// One delegated handler for every quantity input, present or future.
$(document).on('input', 'input[data-sku]', function () {
  onQuantityChange($(this).data('sku'));
});

renderCatalog();