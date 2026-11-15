const customerService = require('../services/customerService');
const customerRepository = require('../repositories/customerRepository');
const bcrypt = require('bcrypt'); //line 50 needs a real hash to compare against
jest.mock('../repositories/customerRepository');

//resets recorded calls before each test; each test runs clean
beforeEach(() => {
  jest.clearAllMocks();
});

describe('customerService.register', () => {
  test('rejects a duplicate email with a 409 and does not insert', async () => {
    customerRepository.findByEmail.mockResolvedValue({
      userID: 1,
      email: 'taken@example.com'
    });

    await expect(
      customerService.register({ email: 'taken@example.com', password: 'password123' })
    ).rejects.toMatchObject({ status: 409 });

    expect(customerRepository.insert).not.toHaveBeenCalled();
  });


    test('stores a bcrypt hash rather than the plaintext password', async () => {
    customerRepository.findByEmail.mockResolvedValue(undefined);
    customerRepository.insert.mockResolvedValue(42);

    await customerService.register({
      email: 'new@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'plaintextpw'
    });

    const saved = customerRepository.insert.mock.calls[0][0];

    expect(saved.password).not.toBe('plaintextpw');
    expect(saved.password).toMatch(/^\$2[aby]\$/);
  });
});


describe('customerService.login', () => {
  test('rejects an unknown email with a 401', async () => {
    customerRepository.findByEmail.mockResolvedValue(undefined);

    await expect(
      customerService.login({ email: 'nobody@example.com', password: 'whatever' })
    ).rejects.toMatchObject({ status: 401 });
  });

  test('rejects a wrong password with a 401', async () => {
    const hash = await bcrypt.hash('correctpassword', 10);
    customerRepository.findByEmail.mockResolvedValue({
      userID: 1,
      email: 'a@b.com',
      password: hash
    });

    await expect(
      customerService.login({ email: 'a@b.com', password: 'wrongpassword' })
    ).rejects.toMatchObject({ status: 401 });
  });
});