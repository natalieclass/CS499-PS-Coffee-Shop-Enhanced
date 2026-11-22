-- =====================================================
-- P.S. Coffee Shop — database schema
-- CS 499 Enhancement Three: Databases
--
-- Rebuilds mydb from scratch. Run 01_schema, then 02_seed.
-- =====================================================

DROP SCHEMA IF EXISTS `mydb`;
CREATE SCHEMA `mydb` DEFAULT CHARACTER SET utf8mb4;
USE `mydb`;


-- -----------------------------------------------------
-- Customer
-- zipCode was INT, which silently dropped leading zeros.
-- email was VARCHAR(500) with no unique constraint, so the
-- same address could register twice.
-- -----------------------------------------------------
CREATE TABLE `Customer` (
  `userID`    INT NOT NULL AUTO_INCREMENT,
  `email`     VARCHAR(255) NOT NULL,
  `password`  VARCHAR(100) NOT NULL,
  `firstName` VARCHAR(45) NOT NULL,
  `lastName`  VARCHAR(45) NOT NULL,
  `custPhone` VARCHAR(20) NULL DEFAULT '000-000-0000',
  `street`    VARCHAR(45) NULL,
  `city`      VARCHAR(45) NOT NULL,
  `state`     VARCHAR(10) NOT NULL,
  `zipCode`   VARCHAR(10) NOT NULL,
  `country`   VARCHAR(45) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `uq_customer_email` (`email`)
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Supplier
-- -----------------------------------------------------
CREATE TABLE `Supplier` (
  `supplierID`    INT NOT NULL AUTO_INCREMENT,
  `supplierName`  VARCHAR(45) NOT NULL,
  `supplierEmail` VARCHAR(60) NULL,
  `supplierPhone` VARCHAR(20) NULL DEFAULT '000-000-0000',
  `supplierType`  VARCHAR(45) NOT NULL,
  `street`        VARCHAR(45) NOT NULL,
  `city`          VARCHAR(45) NOT NULL,
  `state`         VARCHAR(10) NOT NULL,
  `zipCode`       VARCHAR(10) NOT NULL,
  `country`       VARCHAR(45) NOT NULL,
  PRIMARY KEY (`supplierID`),
  UNIQUE KEY `uq_supplier_name` (`supplierName`)
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Employee
-- The primary key was (employeeID, password), so changing a
-- password changed the key. This is what made the original
-- script fail on MySQL 8.0.16+ with a foreign key error.
-- -----------------------------------------------------
CREATE TABLE `Employee` (
  `employeeID`   INT NOT NULL AUTO_INCREMENT,
  `positionCode` INT NULL,
  `firstName`    VARCHAR(45) NULL,
  `lastName`     VARCHAR(45) NULL,
  `emplPhone`    VARCHAR(20) NULL DEFAULT '000-000-0000',
  `password`     VARCHAR(100) NOT NULL,
  PRIMARY KEY (`employeeID`)
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Pay
-- Keyed on payType, so "Salary" could exist exactly once
-- for the whole company. It also had no column for the
-- amount paid.
-- -----------------------------------------------------
CREATE TABLE `Pay` (
  `payID`      INT NOT NULL AUTO_INCREMENT,
  `employeeID` INT NOT NULL,
  `payType`    VARCHAR(45) NOT NULL,
  `payCode`    VARCHAR(45) NULL,
  `payDate`    DATE NOT NULL,
  `payAmount`  DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`payID`),
  KEY `idx_pay_employee` (`employeeID`),
  KEY `idx_pay_date` (`payDate`),
  CONSTRAINT `fk_pay_employee`
    FOREIGN KEY (`employeeID`) REFERENCES `Employee` (`employeeID`)
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- EmployeeOrder
-- Stock ordered from a supplier. orderTotal was DECIMAL,
-- which MySQL reads as DECIMAL(10,0), so $7.65 stored as 8.
-- -----------------------------------------------------
CREATE TABLE `EmployeeOrder` (
  `orderID`    INT NOT NULL AUTO_INCREMENT,
  `orderType`  VARCHAR(45) NOT NULL,
  `quantity`   INT NOT NULL,
  `orderMemo`  VARCHAR(80) NULL,
  `orderTotal` DECIMAL(10,2) NULL,
  `orderDate`  DATE NULL,
  `supplierID` INT NOT NULL,
  `employeeID` INT NOT NULL,
  PRIMARY KEY (`orderID`),
  KEY `idx_emporder_supplier` (`supplierID`),
  KEY `idx_emporder_employee` (`employeeID`),
  CONSTRAINT `fk_emporder_supplier`
    FOREIGN KEY (`supplierID`) REFERENCES `Supplier` (`supplierID`),
  CONSTRAINT `fk_emporder_employee`
    FOREIGN KEY (`employeeID`) REFERENCES `Employee` (`employeeID`)
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- ProductCategory
-- Replaces the separate Milk and Merchandise tables. A new
-- product type is now a row here, not a new table.
-- -----------------------------------------------------
CREATE TABLE `ProductCategory` (
  `categoryID`   INT NOT NULL AUTO_INCREMENT,
  `categoryName` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`categoryID`),
  UNIQUE KEY `uq_category_name` (`categoryName`)
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Product
-- Was CartLineItem, which was always a product catalog
-- rather than a cart. Milk and Merchandise fold in here;
-- neither of them had a name column.
-- -----------------------------------------------------
CREATE TABLE `Product` (
  `productID`   INT NOT NULL AUTO_INCREMENT,
  `sku`         VARCHAR(40) NOT NULL,
  `productName` VARCHAR(100) NOT NULL,
  `categoryID`  INT NOT NULL,
  `unitPrice`   DECIMAL(10,2) NOT NULL,
  `sizeLabel`   VARCHAR(45) NULL,
  `imageFile`   VARCHAR(120) NULL,
  `supplierID`  INT NULL,
  `isActive`    TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`productID`),
  UNIQUE KEY `uq_product_sku` (`sku`),
  KEY `idx_product_name` (`productName`),
  KEY `idx_product_category` (`categoryID`),
  KEY `idx_product_supplier` (`supplierID`),
  CONSTRAINT `fk_product_category`
    FOREIGN KEY (`categoryID`) REFERENCES `ProductCategory` (`categoryID`),
  CONSTRAINT `fk_product_supplier`
    FOREIGN KEY (`supplierID`) REFERENCES `Supplier` (`supplierID`)
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- CustomerOrder
-- New. The application had no way to record a purchase;
-- checkout only displayed an alert.
-- -----------------------------------------------------
CREATE TABLE `CustomerOrder` (
  `orderID`    INT NOT NULL AUTO_INCREMENT,
  `userID`     INT NOT NULL,
  `orderDate`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `subtotal`   DECIMAL(10,2) NOT NULL,
  `tax`        DECIMAL(10,2) NOT NULL,
  `shipping`   DECIMAL(10,2) NOT NULL,
  `orderTotal` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`orderID`),
  KEY `idx_order_date` (`orderDate`),
  KEY `idx_order_user` (`userID`),
  CONSTRAINT `fk_order_customer`
    FOREIGN KEY (`userID`) REFERENCES `Customer` (`userID`)
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- OrderItem
-- New. unitPrice is copied from Product at the time of
-- purchase, so a later price change does not rewrite history.
-- -----------------------------------------------------
CREATE TABLE `OrderItem` (
  `orderID`   INT NOT NULL,
  `productID` INT NOT NULL,
  `quantity`  INT NOT NULL,
  `unitPrice` DECIMAL(10,2) NOT NULL,
  `lineTotal` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`orderID`, `productID`),
  KEY `idx_orderitem_product` (`productID`),
  CONSTRAINT `fk_orderitem_order`
    FOREIGN KEY (`orderID`) REFERENCES `CustomerOrder` (`orderID`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_orderitem_product`
    FOREIGN KEY (`productID`) REFERENCES `Product` (`productID`)
    ON DELETE RESTRICT
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Contact
-- Was keyed on fullName, so two people with the same name
-- could not both submit, and no one could submit twice.
-- -----------------------------------------------------
CREATE TABLE `Contact` (
  `contactID`   INT NOT NULL AUTO_INCREMENT,
  `fullName`    VARCHAR(200) NOT NULL,
  `phone`       VARCHAR(20) NULL,
  `email`       VARCHAR(100) NULL,
  `feedback`    VARCHAR(1000) NOT NULL,
  `submittedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`contactID`),
  KEY `idx_contact_submitted` (`submittedAt`)
) ENGINE = InnoDB;