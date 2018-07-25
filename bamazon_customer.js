const inquirer = require("inquirer");
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "bamazon_db"
});

connection.connect(err => {
    if(err) throw err;
    console.log("Connected!")

    connection.query("SELECT * FROM products", (err, result, fields) => {
        if (err) throw err
        console.log(result)
    });
});