const contactService = require('../services/contactService');
const contactRepository = require('../repositories/contactRepository');

jest.mock('../repositories/contactRepository');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('contactService.saveFeedback', () => {
  test('passes the feedback through to the repository unchanged', async () => {
    const feedback = {
      fullName: 'Test User',
      phone: '555-0100',
      email: 'test@example.com',
      feedback: 'Great coffee'
    };

    await contactService.saveFeedback(feedback);

    expect(contactRepository.insert).toHaveBeenCalledTimes(1);
    expect(contactRepository.insert).toHaveBeenCalledWith(feedback);
  });

  test('propagates a repository error to the caller', async () => {
    contactRepository.insert.mockRejectedValue(new Error('Duplicate entry'));

    await expect(
      contactService.saveFeedback({ fullName: 'Test User' })
    ).rejects.toThrow('Duplicate entry');
  });
});