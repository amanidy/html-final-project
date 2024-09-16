const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const cors = require('cors');

const app = express();
const port = 5000;

dotenv.config();

app.use(cors({
    origin: true, 
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

const db = mysql.createConnection({
    host:process.env.DB_HOST ,
    user:process.env.DB_USER  ,
    password: process.env.DB_PASSWORD ,
    database: 'userdb',
   

});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...')
}
);

app.use(express.static('public'));

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try { 
        const hashedPassword = await bcrypt.hash(password, 10);
        

    db.query('INSERT INTO users(username,password) VALUES(?,?)', [username, hashedPassword], (err, result) => {
        if (err) throw err;
        res.redirect('/login.html');
    });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500.).send('Internal Server Error');
}
});




app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (results.length > 0) {
            const user = results[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.userId = user.id;
                res.redirect('/home.html');
            } else {
                res.status(401).send('Incorrect Password');
            }
        } else {
            res.status(404).send('User not Found');
        }
    });
});

app.post('/add-expense', (req, res) =>{
    const { date, amount, category, description } = req.body;
    const query = 'INSERT INTO expenses(date,amount,category,description) VALUES(?,?,?,?)';
    db.query(query, [date, amount, category, description], (err, result) => {
        if (err) throw err;
        console.log('Expense added:', result);
        res.redirect('/home.html');
    })
})

app.get('/expenses', (req, res) => {
    const query = 'SELECT DATE_FORMAT(date, "%Y-%m-%d") AS date, amount, category, description FROM expenses';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrival:', err);
            res.status(500).send('Internal server error');
        }
        res.json(results);
    });
});


app.delete('/delete-expense/:id', (req, res) => {
    const id = req.params.id;
    console.log('Received DELETE request for ID:', id);
    if (!id) {
        console.error('Invalid ID');
        return res.status(400).send('Invalid ID');
    }

    const query = 'DELETE FROM expenses WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (result.affectedRows === 0) {
            console.error('No expense found with the given ID');
            return res.status(404).send('Expense Not Found');
        }
        res.sendStatus(200);
    });
});






app.get('/expenses/:id', (req, res) => {
    const expenseId = req.params.id;
    const query = 'SELECT * FROM expenses WHERE id = ?';

    db.query(query, [expenseId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal Server Error');
        }
        if (results.length === 0) {
            return res.status(404).send('Expense Not Found');
        }
        res.json(results[0]); // Send the expense data back as JSON
    });
});


app.post('/edit-expense', (req, res) => {
    const { id, date, amount, category, description } = req.body;
    const query = 'UPDATE expenses SET date = ?, amount = ?, category = ?, description = ? WHERE id = ?';
    db.query(query, [date, amount, category, description, id], (err, result) => {
        if (err) throw err;
        console.log('Expense updated:', result);
        res.redirect('/home.html');
    });
});



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
