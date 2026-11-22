// Test fixture only now.
//
// This file used to be the application's product catalog. Since Enhancement
// Three it is no longer loaded by the browser — the catalog comes from
// GET /api/products, which reads the Product and ProductCategory tables.
//
// It remains here so the cart and query unit tests have stable data to run
// against without needing a database. Changing a price here affects the
// tests only. To change what the shop sells, edit the database.

const CATALOG = {
  'DVG-FRENCH-VANILLA': {
    name: 'DVG French Vanilla Syrup',
    priceCents: 765,
    size: '25.4 FL OZ',
    category: 'syrup',
    image: '/psclient/images/DVG/DVGfrenchvanilla.jpeg',
    alt: 'French Vanilla'
  },
  'DVG-RASPBERRY': {
    name: 'DVG Raspberry Syrup',
    priceCents: 632,
    size: '25.4 FL OZ',
    category: 'syrup',
    image: '/psclient/images/DVG/DVGraspberry.jpeg',
    alt: 'Raspberry'
  },
  
  'DVG-WHITE-CHOCOLATE-SAUCE': {
    name: 'DVG White Chocolate Sauce',
    priceCents: 1245,
    size: '64 FL OZ',
    category: 'sauce',
    image: '/psclient/images/DVG/DVGwhiteChocoSauce.jpeg',
    alt: 'White Chocolate Sauce'
  },
  
  'DVG-PUMPKIN-SAUCE': {
    name: 'DVG Pumpkin Sauce',
    priceCents: 1342,
    size: '64 FL OZ',
    category: 'sauce',
    image: '/psclient/images/DVG/DVGpumpkin.jpeg',
    alt: 'Pumpkin Sauce'
  },
  
  'DVG-CHOCOLATE-SAUCE': {
    name: 'DVG Chocolate Sauce',
    priceCents: 1245,
    size: '64 FL OZ',
    category: 'sauce',
    image: '/psclient/images/DVG/DVGchocoSauce.jpeg',
    alt: 'Chocolate Sauce'
  },
  
  'DVG-CARAMEL': {
    name: 'DVG Caramel  Syrup',
    priceCents: 721,
    size: '25.4 FL OZ',
    category: 'syrup',
    image: '/psclient/images/DVG/DVGsfCaramel.jpeg',
    alt: 'Caramel'
  },
  
  'DVG-IRISH-CREAM': {
    name: 'DVG Irish Cream Syrup',
    priceCents: 678,
    size: '25.4 FL OZ',
    category: 'syrup',
    image: '/psclient/images/DVG/DVGsgIrishCream.jpeg',
    alt: 'Irish Cream'
  },
  
  'DVG-STRAWBERRY': {
    name: 'DVG Strawberry Syrup',
    priceCents: 545,
    size: '25.4 FL OZ',
    category: 'syrup',
    image: '/psclient/images/DVG/DVGstrawberry.jpeg',
    alt: 'Strawberry'
  }

};

if (typeof module !== 'undefined') {
  module.exports = CATALOG;
}