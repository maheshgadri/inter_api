const express = require('express');
const mysql = require('mysql');
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


module.exports = (ngrokUrl) => {
    router.get('/responses', (req, res) => {
      // Fetch all data from destination_openai_response table
      const getAllDataQuery = 'SELECT id, question_text, option1, option2, option3, option4 FROM destination_openai_response';
  
      connection.query(getAllDataQuery, (err, results) => {
        if (err) {
          console.error('Error fetching data:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ error: 'No data found' });
        }
  
        const responseData = results.map((result) => {
          return {
            id: result.id,
            question_text: result.question_text.trim(),
            option1: result.option1.trim(),
            option2: result.option2.trim(),
            option3: result.option3.trim(),
            option4: result.option4.trim()
          };
        });
  
        res.json(responseData);
      });
    });
  
    return router;
  };