-- =====================================================
-- P.S. Coffee Shop — sample data
-- CS 499 Enhancement Three: Databases
--
-- Run after 01_schema.sql.
-- =====================================================

USE `mydb`;

INSERT INTO `ProductCategory` (`categoryName`) VALUES
  ('syrup'),
  ('sauce');

INSERT INTO `Supplier`
  (`supplierName`, `supplierEmail`, `supplierPhone`, `supplierType`,
   `street`, `city`, `state`, `zipCode`, `country`)
VALUES
  ('DaVinci Gourmet', 'orders@davincigourmet.com', '800-555-0142', 'Syrups and Sauces',
   '2001 1st Ave S', 'Seattle', 'WA', '98134', 'USA');

-- Look up the generated IDs rather than assuming they are 1 and 2,
-- so this script is correct no matter what the auto-increment is at.
SET @syrup = (SELECT `categoryID` FROM `ProductCategory` WHERE `categoryName` = 'syrup');
SET @sauce = (SELECT `categoryID` FROM `ProductCategory` WHERE `categoryName` = 'sauce');
SET @dvg   = (SELECT `supplierID`  FROM `Supplier`        WHERE `supplierName` = 'DaVinci Gourmet');

INSERT INTO `Product`
  (`sku`, `productName`, `categoryID`, `unitPrice`, `sizeLabel`, `imageFile`, `supplierID`)
VALUES
  ('DVG-FRENCH-VANILLA',        'DVG French Vanilla Syrup',  @syrup,  7.65, '25.4 FL OZ', 'DVGfrenchvanilla.jpeg',   @dvg),
  ('DVG-RASPBERRY',             'DVG Raspberry Syrup',       @syrup,  6.32, '25.4 FL OZ', 'DVGraspberry.jpeg',       @dvg),
  ('DVG-CARAMEL',               'DVG Caramel Syrup',         @syrup,  7.21, '25.4 FL OZ', 'DVGsfCaramel.jpeg',       @dvg),
  ('DVG-IRISH-CREAM',           'DVG Irish Cream Syrup',     @syrup,  6.78, '25.4 FL OZ', 'DVGsgIrishCream.jpeg',    @dvg),
  ('DVG-STRAWBERRY',            'DVG Strawberry Syrup',      @syrup,  5.45, '25.4 FL OZ', 'DVGstrawberry.jpeg',      @dvg),
  ('DVG-CHOCOLATE-SAUCE',       'DVG Chocolate Sauce',       @sauce, 12.45, '64 FL OZ',   'DVGchocoSauce.jpeg',      @dvg),
  ('DVG-PUMPKIN-SAUCE',         'DVG Pumpkin Sauce',         @sauce, 13.42, '64 FL OZ',   'DVGpumpkin.jpeg',         @dvg),
  ('DVG-WHITE-CHOCOLATE-SAUCE', 'DVG White Chocolate Sauce', @sauce, 12.45, '64 FL OZ',   'DVGwhiteChocoSauce.jpeg', @dvg);


  -- -----------------------------------------------------
-- Sample customers
-- Password for all three is Password123. Development data only.
-- -----------------------------------------------------
INSERT INTO `Customer`
  (`email`, `password`, `firstName`, `lastName`, `custPhone`,
   `street`, `city`, `state`, `zipCode`, `country`)
VALUES
  ('natalie@example.com', '$2b$10$VAw/Iobb65bM6XGa9Ca.NuBPbTsiPw3Z/uGsrmeH2aAIpWNfOENLO', 'Natalie', 'Class', '732-555-0101',
   '14 Ocean Ave', 'Tinton Falls', 'NJ', '07712', 'USA'),
  ('shannon@example.com', '$2b$10$VAw/Iobb65bM6XGa9Ca.NuBPbTsiPw3Z/uGsrmeH2aAIpWNfOENLO', 'Shannon', 'Reed',  '732-555-0102',
   '8 Maple St', 'Red Bank', 'NJ', '07701', 'USA'),
  ('devon@example.com',   '$2b$10$VAw/Iobb65bM6XGa9Ca.NuBPbTsiPw3Z/uGsrmeH2aAIpWNfOENLO', 'Devon',   'Park',  '732-555-0103',
   '220 Broad St', 'Freehold', 'NJ', '07728', 'USA');

SET @cust1 = (SELECT `userID` FROM `Customer` WHERE `email` = 'natalie@example.com');
SET @cust2 = (SELECT `userID` FROM `Customer` WHERE `email` = 'shannon@example.com');
SET @cust3 = (SELECT `userID` FROM `Customer` WHERE `email` = 'devon@example.com');

SET @fv     = (SELECT `productID` FROM `Product` WHERE `sku` = 'DVG-FRENCH-VANILLA');
SET @rasp   = (SELECT `productID` FROM `Product` WHERE `sku` = 'DVG-RASPBERRY');
SET @caramel= (SELECT `productID` FROM `Product` WHERE `sku` = 'DVG-CARAMEL');
SET @irish  = (SELECT `productID` FROM `Product` WHERE `sku` = 'DVG-IRISH-CREAM');
SET @straw  = (SELECT `productID` FROM `Product` WHERE `sku` = 'DVG-STRAWBERRY');
SET @choc   = (SELECT `productID` FROM `Product` WHERE `sku` = 'DVG-CHOCOLATE-SAUCE');
SET @pump   = (SELECT `productID` FROM `Product` WHERE `sku` = 'DVG-PUMPKIN-SAUCE');
SET @white  = (SELECT `productID` FROM `Product` WHERE `sku` = 'DVG-WHITE-CHOCOLATE-SAUCE');


-- -----------------------------------------------------
-- Sample orders across three months, so the reporting
-- queries have something to group and total.
-- -----------------------------------------------------
INSERT INTO `CustomerOrder` (`userID`, `orderDate`, `subtotal`, `tax`, `shipping`, `orderTotal`)
VALUES (@cust1, '2026-09-14 10:22:00', 13.97, 0.98, 15.00, 29.95);
SET @o1 = LAST_INSERT_ID();
INSERT INTO `OrderItem` (`orderID`, `productID`, `quantity`, `unitPrice`, `lineTotal`) VALUES
  (@o1, @fv,   1,  7.65,  7.65),
  (@o1, @rasp, 1,  6.32,  6.32);

INSERT INTO `CustomerOrder` (`userID`, `orderDate`, `subtotal`, `tax`, `shipping`, `orderTotal`)
VALUES (@cust2, '2026-09-28 16:05:00', 24.90, 1.74, 15.00, 41.64);
SET @o2 = LAST_INSERT_ID();
INSERT INTO `OrderItem` (`orderID`, `productID`, `quantity`, `unitPrice`, `lineTotal`) VALUES
  (@o2, @choc, 2, 12.45, 24.90);

INSERT INTO `CustomerOrder` (`userID`, `orderDate`, `subtotal`, `tax`, `shipping`, `orderTotal`)
VALUES (@cust3, '2026-10-03 09:41:00', 40.26, 2.82, 15.00, 58.08);
SET @o3 = LAST_INSERT_ID();
INSERT INTO `OrderItem` (`orderID`, `productID`, `quantity`, `unitPrice`, `lineTotal`) VALUES
  (@o3, @pump, 3, 13.42, 40.26);

INSERT INTO `CustomerOrder` (`userID`, `orderDate`, `subtotal`, `tax`, `shipping`, `orderTotal`)
VALUES (@cust1, '2026-10-17 13:30:00', 18.11, 1.27, 15.00, 34.38);
SET @o4 = LAST_INSERT_ID();
INSERT INTO `OrderItem` (`orderID`, `productID`, `quantity`, `unitPrice`, `lineTotal`) VALUES
  (@o4, @straw,   2, 5.45, 10.90),
  (@o4, @caramel, 1, 7.21,  7.21);

INSERT INTO `CustomerOrder` (`userID`, `orderDate`, `subtotal`, `tax`, `shipping`, `orderTotal`)
VALUES (@cust2, '2026-10-29 11:15:00', 24.90, 1.74, 15.00, 41.64);
SET @o5 = LAST_INSERT_ID();
INSERT INTO `OrderItem` (`orderID`, `productID`, `quantity`, `unitPrice`, `lineTotal`) VALUES
  (@o5, @white, 1, 12.45, 12.45),
  (@o5, @choc,  1, 12.45, 12.45);

INSERT INTO `CustomerOrder` (`userID`, `orderDate`, `subtotal`, `tax`, `shipping`, `orderTotal`)
VALUES (@cust3, '2026-11-08 18:02:00', 27.12, 1.90, 15.00, 44.02);
SET @o6 = LAST_INSERT_ID();
INSERT INTO `OrderItem` (`orderID`, `productID`, `quantity`, `unitPrice`, `lineTotal`) VALUES
  (@o6, @irish, 4, 6.78, 27.12);

INSERT INTO `CustomerOrder` (`userID`, `orderDate`, `subtotal`, `tax`, `shipping`, `orderTotal`)
VALUES (@cust1, '2026-11-15 14:47:00', 34.17, 2.39, 15.00, 51.56);
SET @o7 = LAST_INSERT_ID();
INSERT INTO `OrderItem` (`orderID`, `productID`, `quantity`, `unitPrice`, `lineTotal`) VALUES
  (@o7, @fv,    2,  7.65, 15.30),
  (@o7, @straw, 1,  5.45,  5.45),
  (@o7, @pump,  1, 13.42, 13.42);