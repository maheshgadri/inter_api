const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'inter'
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

const bcrypt = require('bcrypt');

module.exports = () => { // Removed `db` parameter as it's not being used
  const router = express.Router();

  router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE `email` = ?";
    connection.query(sql, [email], (err, result) => { // Use `connection` object instead of `db`
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (result.length > 0) {
        const user = result[0];
        bcrypt.compare(password, user.password, (err, isValid) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to compare passwords' });
          }

          if (isValid) {
            const token = jwt.sign({ id: user.id }, "jwtSecretKey", { expiresIn: 300 });
            return res.json({
              success: true,
              message: 'Login successful',
              token,
              user: {
                id: user.id,
                username: user.username,
                email: user.email
              }
            });
          } else {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
          }
        });
      } else {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
    });
  });

  return router;
};