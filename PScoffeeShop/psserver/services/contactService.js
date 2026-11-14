const contactRepository = require('../repositories/contactRepository');

async function saveFeedback(input) {
  await contactRepository.insert(input);
}

module.exports = { saveFeedback };