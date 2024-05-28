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

  router.post('/saveResponses', (req, res) => {
    const { question_text, options, answer } = req.body;

    if (!question_text || !options || !answer) {
      return res.status(400).json({ error: 'question_text, options, and answer are required' });
    }

    // Insert question, options, and answer into MySQL database
    const query = 'INSERT INTO destination_openai_response (question_text, option1, option2, option3, option4, answer) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [question_text, options[0], options[1], options[2], options[3], answer];

    connection.query(query, values, (err, result) => {
      if (err) {
        console.error('Error inserting question into database:', err);
        return res.status(500).json({ error: 'Database insertion failed' });
      }
      console.log('Question inserted into database:', result);
      return res.status(200).json({ success: 'Question inserted successfully', result });
    });
  });

  return router;
};


