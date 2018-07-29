const mysql = require('mysql');
const inquirer = require('inquirer');
const colors = require('colors');
const Table = require('cli-table');

// =========DATABASE CONNECTION ============ //

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_db"
});

connection.connect((err) => {
    if (err) throw err
    managerScreen();
});

// ======================MAIN FUNCTION=================== //

const managerScreen = () => {
    // inquirer prompt for choices

    inquirer.prompt([
        {
            type: "list",
            name: "commands",
            message: "Welcome, Please select a command",
            choices: ["1. View Products", "2. Low Inventory", "3. Update Inventory", "4. Add Product"]
        }
    ]).then(response => {

        // switch statement for each command
        switch (response.commands) {
            case "1. View Products":
                viewProducts();
                break;
            case "2. Low Inventory":
                lowInventory();
                break;
            case "3. Update Inventory":
                updateInventory();
                break;
            case "4. Add Product":
                addProduct();
                break;
        }
    })
}

// =====================FUNCTION SECTION================ //

function newCommand() {
    inquirer.prompt([{
        type: 'confirm',
        name: 'choice',
        message: 'Would you like to perform another transaction?'
    }]).then(function (response) {
        if (response.choice) {
            managerScreen();
        }
        else {
            console.log('Have a good day');
            connection.end();
        }
    })
};

function viewProducts() {

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
        newCommand();
    })
};

function lowInventory() {

    connection.query('SELECT * FROM products WHERE stock_quantity < 5', (err, result) => {
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
        };
        console.log("\n")
        console.log(table.toString());
        newCommand();
    });
};

function updateInventory() {

    // Bring up the table of products
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
        console.log("\n");
        console.log(table.toString());

        // grab the item ID
        inquirer.prompt([
            {
                type: "input",
                name: "id",
                message: "Please select the ID of the item you would like to adjust",
            },
            {
                type: "list",
                name: "update",
                message: "Would you like too add or subtract?",
                choices: ["+", "-"]
            },
            {
                type: "input",
                name: "quantity",
                message: "By how much?"
            }
        ]).then(response => {
            // if statement for type of update
            if (response.update == "+") {
                // make the database query
                connection.query("SELECT * FROM products WHERE id = ?", response.id, (err, result) => {
                    // make the database update query
                    connection.query("UPDATE products SET ? WHERE ?", [
                        { stock_quantity: result[0].stock_quantity + parseInt(response.quantity) }, { id: response.id }
                    ], (err, result) => {
                        if (err) throw err
                        console.log("Inventory Updated")
                        newCommand();
                    });
                });
            }
            else if (response.update == "-") {
                // make the database query
                connection.query("SELECT * FROM products WHERE id = ?", response.id, (err, result) => {
                    // make the database update query
                    connection.query("UPDATE products SET ? WHERE ?", [
                        { stock_quantity: result[0].stock_quantity - parseInt(response.quantity) }, { id: response.id }
                    ], (err, result) => {
                        if (err) throw err
                        console.log("Inventory Updated")
                        newCommand();
                    });
                });
            };
        });
    });
};

function addProduct() {
    // inquirer for new product information
    inquirer.prompt([
        {
            type: "input",
            name: "item",
            message: "What is the name of the item you would like to add?"
        },
        {
            type: "input",
            name: "department",
            message: "What department does this belong too?"
        },
        {
            type: "input",
            name: "price",
            message: "What is the price of the item?" 
        },
        {
            type: "input",
            name: "quantity",
            message: "How many of this item are you adding?"
        }
    ]).then(response => {
        // insert new item data into database
        connection.query("INSERT INTO products SET ?", [{
            product_name: response.item,
            department_name: response.department,
            price: response.price,
            stock_quantity: response.quantity
        }], (err, result) => {
            if (err) throw err

            console.log("Item added")
            newCommand();
        })
    })
}