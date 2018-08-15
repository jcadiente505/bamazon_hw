CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products (
    'id' INTEGER(10) NOT NULL AUTO_INCREMENT,
    'product_name' VARCHAR(30),
    'department_name' VARCHAR(30),
    'price' DECIMAL(10,2)
    'stock_quantity' INTEGER(10),
    'product_sales' DECIMAL(10, 2)
    PRIMARY KEY('ID')
);

CREATE TABLE departments (
    'depo_id' INTEGER(10) NOT NULL AUTO_INCREMENT,
    'depo_name' VARCHAR(30),
    'overhead_costs' DECIMAL(10,2);
    PRIMARY KEY('depo_id')
);
