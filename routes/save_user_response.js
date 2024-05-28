const express = require('express');
const mysql = require('mysql');

module.exports = function(ngrokUrl) {
  const router = express.Router();

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

  router.post('/saveUserResponse', (req, res) => {
    const { user_id, question_id, selected_option } = req.body;

    if (!user_id || !question_id || !selected_option) {
      return res.status(400).json({ error: 'user_id, question_id, and selected_option are required' });
    }

    // Insert user response into MySQL database
    const query = 'INSERT INTO user_responses (user_id, question_id, selected_option) VALUES (?, ?, ?)';
    const values = [user_id, question_id, selected_option];

    connection.query(query, values, (err, result) => {
      if (err) {
        console.error('Error inserting user response into database:', err);
        return res.status(500).json({ error: 'Database insertion failed' });
      }
      console.log('User response inserted into database:', result);
      return res.status(200).json({ success: 'User response inserted successfully', result });
    });
  });

  return router;
};