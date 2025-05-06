const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));  // Serve your HTML & static files

// ✅ Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '{Niranjan03}',  // 👈 your exact password
    database: 'food_delivery'
});

db.connect((err) => {
    if (err) {
        console.error('DB connection error:', err);
        return;
    }
    console.log('Connected to MySQL database ✅');
});

// ✅ Home route
app.get('/', (req, res) => {
    res.send('Welcome to the Food Delivery API 🚀');
});

// ✅ Get all restaurants
app.get('/restaurants', (req, res) => {
    db.query('SELECT * FROM restaurants', (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// ✅ Get menu for a specific restaurant
app.get('/restaurants/:id/menu', (req, res) => {
    const restaurantId = req.params.id;
    db.query(
        'SELECT * FROM menu_items WHERE restaurant_id = ?',
        [restaurantId],
        (err, result) => {
            if (err) return res.status(500).send(err);
            res.json(result);
        }
    );
});

// ✅ Place an order
app.post('/orders', (req, res) => {
    const { customer_name, total_price } = req.body;
    const sql = 'INSERT INTO orders (customer_name, total_price) VALUES (?, ?)';
    db.query(sql, [customer_name, total_price], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Order placed successfully', orderId: result.insertId });
    });
});

// ✅ Get order status
app.get('/orders/:id', (req, res) => {
    const orderId = req.params.id;
    db.query('SELECT * FROM orders WHERE id = ?', [orderId], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.length === 0) return res.status(404).json({ error: 'Order not found' });
        res.json(result[0]);
    });
});

// ✅ Search menu items (🍕 🍔 🥪)
app.get('/search', (req, res) => {
    const searchQuery = req.query.q;  // 👈 dynamic search from query param

    if (!searchQuery) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const sql = `SELECT * FROM menu_items WHERE name LIKE ?`;
    db.query(sql, [`%${searchQuery}%`], (err, result) => {
        if (err) {
            console.error('Search error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(result);
    });
});

// ✅ Cart endpoint (basic in-memory cart for demo)
let cart = [];

app.post('/cart', (req, res) => {
    const { item_id, quantity } = req.body;
    if (!item_id || !quantity) {
        return res.status(400).json({ error: 'Item ID and quantity are required' });
    }
    cart.push({ item_id, quantity });
    res.json({ message: 'Item added to cart', cart });
});

app.get('/cart', (req, res) => {
    res.json(cart);  // 🛒 returns the current cart (empty until you add items)
});

// Clear the cart (optional route)
app.post('/cart/clear', (req, res) => {
    let cart = [];
    res.json({ message: 'Cart cleared' });
});

// ✅ Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} 🚀`);
});
