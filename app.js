const express = require('express');
const bodyParser = require('body-parser');
const mssql = require('mssql');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Configure database connection
const config = {
    server: 'server325.database.windows.net',
    database: 'newSQLDB',
    user: 'server325',
    password: process.env.PASSWORD,
    options: {
        trustServerCertificate: true
    }
};

// Create a pool of connections
const pool = new mssql.ConnectionPool(config);
const poolConnect = pool.connect();

// Routes
app.get('/', async (req, res) => {
    await poolConnect;
    try {
        const result = await pool.request().query('SELECT * FROM Products');
        const products = result.recordset;
        res.render('index', { products });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/add_product', async (req, res) => {
    await poolConnect;
    try {
        const { productName, productDescription, productPrice, manufacturer, category, stockQuantity } = req.body;
        await pool.request()
            .input('productName', mssql.NVarChar, productName)
            .input('productDescription', mssql.NVarChar, productDescription)
            .input('productPrice', mssql.Decimal, parseFloat(productPrice))
            .input('manufacturer', mssql.NVarChar, manufacturer)
            .input('category', mssql.NVarChar, category)
            .input('stockQuantity', mssql.Int, parseInt(stockQuantity))
            .query('INSERT INTO Products (Name, Description, Price, Manufacturer, Category, StockQuantity) VALUES (@productName, @productDescription, @productPrice, @manufacturer, @category, @stockQuantity)');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});




