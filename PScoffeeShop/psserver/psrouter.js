const path = require('path');

const PAGES = {
  '/': 'HomePage.html',
  '/SignIn': 'SignIn.html',
  '/CreateAccount': 'CreateAccount.html',
  '/PSDashboard': 'PSDashboard.html',
  '/Contact': 'Contact.html',
  '/SyrupsNSauces': 'SyrupsSauces.html',
  '/WorkWithUs': 'WorkWithUs.html',
  '/Member': 'Member.html',
  '/About': 'About.html',
  '/Menu': 'Menu.html',
  '/Subscriptions': 'Subscriptions.html'
};

const psrouter = function (psapp) {
  Object.entries(PAGES).forEach(([route, file]) => {
    psapp.get(route, function (req, res) {
      res.status(200).sendFile(path.join(__dirname, '..', 'psclient', 'HTMLcode', file));
    });
  });
};

module.exports = psrouter;