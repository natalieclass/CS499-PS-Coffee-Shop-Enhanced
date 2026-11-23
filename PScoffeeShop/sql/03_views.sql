-- =====================================================
-- P.S. Coffee Shop — reporting views
-- CS 499 Enhancement Three: Databases
--
-- Run after 01_schema.sql and 02_data.sql.
--
-- The original database could answer nothing about sales,
-- because it had no order tables. These views answer the
-- questions a shop owner would actually ask.
-- =====================================================

USE `mydb`;


-- Which category earns more, syrups or sauces?
CREATE OR REPLACE VIEW `vw_RevenueByCategory` AS
SELECT c.`categoryName`,
       SUM(oi.`quantity`)  AS `unitsSold`,
       SUM(oi.`lineTotal`) AS `revenue`
  FROM `OrderItem` oi
  JOIN `Product` p          ON p.`productID`  = oi.`productID`
  JOIN `ProductCategory` c  ON c.`categoryID` = p.`categoryID`
 GROUP BY c.`categoryName`
 ORDER BY `revenue` DESC;


-- What sells best, by units and by revenue?
CREATE OR REPLACE VIEW `vw_BestSellingProducts` AS
SELECT p.`sku`,
       p.`productName`,
       c.`categoryName`,
       SUM(oi.`quantity`)          AS `unitsSold`,
       SUM(oi.`lineTotal`)         AS `revenue`,
       COUNT(DISTINCT oi.`orderID`) AS `orderCount`
  FROM `OrderItem` oi
  JOIN `Product` p         ON p.`productID`  = oi.`productID`
  JOIN `ProductCategory` c ON c.`categoryID` = p.`categoryID`
 GROUP BY p.`sku`, p.`productName`, c.`categoryName`
 ORDER BY `unitsSold` DESC;


-- Which suppliers' products bring in the most money?
CREATE OR REPLACE VIEW `vw_RevenueBySupplier` AS
SELECT s.`supplierName`,
       COUNT(DISTINCT p.`productID`) AS `productsSold`,
       SUM(oi.`quantity`)            AS `unitsSold`,
       SUM(oi.`lineTotal`)           AS `revenue`
  FROM `OrderItem` oi
  JOIN `Product` p   ON p.`productID`  = oi.`productID`
  JOIN `Supplier` s  ON s.`supplierID` = p.`supplierID`
 GROUP BY s.`supplierName`
 ORDER BY `revenue` DESC;


-- How is the shop doing month to month?
CREATE OR REPLACE VIEW `vw_MonthlySales` AS
SELECT DATE_FORMAT(o.`orderDate`, '%Y-%m') AS `salesMonth`,
       COUNT(*)               AS `orderCount`,
       SUM(o.`subtotal`)      AS `subtotal`,
       SUM(o.`tax`)           AS `taxCollected`,
       SUM(o.`orderTotal`)    AS `revenue`
  FROM `CustomerOrder` o
 GROUP BY DATE_FORMAT(o.`orderDate`, '%Y-%m')
 ORDER BY `salesMonth`;


-- =====================================================
-- Queries that take parameters cannot be views, since a
-- view has no inputs. These are run from the application
-- or by hand with the dates filled in.
-- =====================================================

-- Best sellers within a date range:
--
--   SELECT p.productName, SUM(oi.quantity) AS unitsSold, SUM(oi.lineTotal) AS revenue
--     FROM OrderItem oi
--     JOIN CustomerOrder o ON o.orderID = oi.orderID
--     JOIN Product p       ON p.productID = oi.productID
--    WHERE o.orderDate >= ? AND o.orderDate < ?
--    GROUP BY p.productName
--    ORDER BY unitsSold DESC;
--
-- Products that have never been ordered. A LEFT JOIN keeps
-- every product, and the IS NULL finds the ones with no
-- matching order line:
--
--   SELECT p.sku, p.productName
--     FROM Product p
--     LEFT JOIN OrderItem oi ON oi.productID = p.productID
--    WHERE oi.productID IS NULL;