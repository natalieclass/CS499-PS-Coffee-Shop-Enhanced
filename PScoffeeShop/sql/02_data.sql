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