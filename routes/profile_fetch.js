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

module.exports = () => {
  
  const router = express.Router();

  router.post('/profile_fetch', (req, res) => {
    const { id } = req.body; // Use `id` instead of `email` and `password`

    const sql = "SELECT id,username,email FROM users WHERE `id` = ?";
    connection.query(sql, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(result[0]);
    });
  });

  return router;
};
