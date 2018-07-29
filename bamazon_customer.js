// ==========NPM VARIABLES================ //

const inquirer = require("inquirer");
const mysql = require("mysql");
const Table = require("cli-table");
const colors = require('colors');

// ===========MySQL Database connection========= //

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "bamazon_db"
});

connection.connect(err => {
    if (err) throw err;
    console.log("Connected!")
    shopping();
});

// ===========Shopping Function========= //

const shopping = function () {
    productTable();
}

// =================TABLE CONSTRUCTOR============== //

const productTable = () => {

    connection.query("SELECT id, product_name, price, stock_quantity FROM products", (err, result) => {
        if (err) throw err
        const table = new Table({
            head: ['Id#', 'Product Name', 'Price', 'Quantity'],
            style: {
                head: ['blue'],
                compact: false,
                colAligns: ['center'],
            }
        });

        for (let i = 0; i < result.length; i++) {
            table.push([result[i].id, result[i].product_name, result[i].price, result[i].stock_quantity])
        }
        console.log("\n")
        console.log(table.toString());
        userInput();
    });
};

// ====================INQUIRER FUNCTION================ //

const userInput = () => {

    inquirer.prompt([
        {
            name: "itemID",
            type: "input",
            message: "Please type the ID of the item you would like to purchase?",
        },
        {
            name: "quantity",
            type: "input",
            message: "How much would you like to purchase?"
        }
    ]).then(response => {

        let purchase = parseInt(response.itemID);
        let purchaseQ = response.quantity;

        connection.query("SELECT * FROM products WHERE id = ? ", purchase, (err, result) => {
            if (err) throw err
            // check quantity in store
            console.log(purchase)
            console.log(purchaseQ)
            console.log(result)

            if (purchaseQ < result[0].stock_quantity) {
                console.log("You Bought: " + purchaseQ + " " + result[0].product_name)
                let total = result[0].price * purchaseQ
                console.log("Your total is: " + total)

                newQuantity = result[0].stock_quantity - purchaseQ;

                // connects to the mysql database products and updates the stock quantity for the item puchased
                connection.query("UPDATE products SET stock_quantity = " + newQuantity + " WHERE id = " + purchase, function (err, result) {
                    // if(err) throw err;
                    console.log(colors.cyan('Your order has been processed.  Thank you for shopping with us!'));
                    newOrder();
                })
            }
            else {
                console.log("That product is Out of Stock!")
                connection.end();
            }

        });
    })
}

function newOrder(){
	inquirer.prompt([{
		type: 'confirm',
		name: 'choice',
		message: 'Would you like to place another order?'
	}]).then(function(answer){
		if(answer.choice){
			productTable();
		}
		else{
			console.log('Thank you for shopping at Bamazon!');
			connection.end();
		}
	})
};

