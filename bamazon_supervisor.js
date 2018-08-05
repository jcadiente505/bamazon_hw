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
    console.log("success")
    supervisorScreen()
});

// ======================MAIN FUNCTION=================== //

function supervisorScreen() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'command',
            message: "Hello Mr. Bezos, What would you like to do today?",
            choices: ["1. View Sales By Department", "2. Add new Department"]
        }
    ]).then(response => {
        console.log(response)
        if (response.command === '1. View Sales By Department') {
            console.log('test');
            connection.query("SELECT d.depo_id, d.depo_name, d.overhead_costs, (SELECT SUM(p.product_sales)) AS total_sales, (SELECT SUM(p.product_sales) - d.overhead_costs) AS total_profit FROM departments d LEFT JOIN products p ON d.depo_name = p.department_name GROUP BY depo_id;", (err, result) => {
                if (err) throw err;
                const table = new Table({
                    head: ['ID', 'Department', 'Over Head Costs', 'Product Sales', 'Total Profits'],
                    style: {
                        head: ['blue'],
                        compact: false,
                        colAligns: ['center'],
                    }
                });

                for (let i = 0; i < result.length; i++) {
                    table.push([result[i].depo_id, result[i].depo_name, "$" + result[i].overhead_costs, "$" + result[i].total_sales, "$" + result[i].total_profit]);
                };
                console.log("\n")
                console.log(table.toString());
                newCommand();
            })

        }
        else {
            inquirer.prompt([
                {
                    type: "input",
                    name: "department",
                    message: "What is the name of the department you would like to add?"
                },
                {
                    type: "input",
                    name: "overhead",
                    message: "What is the overhead cost of this department?"
                }
            ]).then(response => {
                // insert new item data into database
                connection.query("INSERT INTO departments SET ?", [{

                    depo_name: response.department,
                    overhead_costs: response.overhead,
                }], (err, result) => {
                    if (err) throw err
        
                    console.log("Department added")
                    newCommand();
                })
            })
        }
    })
}

function newCommand() {
    inquirer.prompt([{
        type: 'confirm',
        name: 'choice',
        message: 'Would you like to perform another transaction?'
    }]).then(function (response) {
        if (response.choice) {
            supervisorScreen();
        }
        else {
            console.log('Have a good day');
            connection.end();
        }
    })
};
