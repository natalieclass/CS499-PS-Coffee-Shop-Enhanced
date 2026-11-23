-- =====================================================
-- P.S. Coffee Shop — application database user
--
-- The application connects as this user, not as root.
-- Grants are per table and per operation: exactly what the
-- code does, and nothing else. No DELETE, no DROP, no ALTER.
-- =====================================================

CREATE USER IF NOT EXISTS 'pscoffee_app'@'localhost'
  IDENTIFIED BY 'CHANGE_THIS_PASSWORD';

-- Customers register, sign in, and edit their own details.
GRANT SELECT, INSERT, UPDATE ON `mydb`.`Customer` TO 'pscoffee_app'@'localhost';

-- The catalog is read only. The application never changes products.
GRANT SELECT ON `mydb`.`Product`         TO 'pscoffee_app'@'localhost';
GRANT SELECT ON `mydb`.`ProductCategory` TO 'pscoffee_app'@'localhost';

-- Orders are written once and read back. Never updated, never deleted.
GRANT SELECT, INSERT ON `mydb`.`CustomerOrder` TO 'pscoffee_app'@'localhost';
GRANT SELECT, INSERT ON `mydb`.`OrderItem`     TO 'pscoffee_app'@'localhost';

-- Feedback is write-only from the application's point of view.
GRANT INSERT ON `mydb`.`Contact` TO 'pscoffee_app'@'localhost';

FLUSH PRIVILEGES;