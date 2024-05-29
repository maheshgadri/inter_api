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
 
  // New API endpoint to get the score
  router.get('/score', (req, res) => {
    const scoreQuery = `
      SELECT COUNT(*) AS score
      FROM destination_openai_response dor
      JOIN user_responses ur
      ON dor.answer = ur.selected_option
      AND dor.id = ur.question_id;
    `;

    connection.query(scoreQuery, (err, results) => {
      if (err) {
        console.error('Error calculating score:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'No data found' });
      }

      const score = results[0].score;

      // Count the number of correct match answers
      const correctMatchCountQuery = `
        SELECT COUNT(*) AS correctMatchCount
        FROM destination_openai_response dor
        JOIN user_responses ur
        ON dor.answer = ur.selected_option
        AND dor.id = ur.question_id;
      `;

      connection.query(correctMatchCountQuery, (err, results) => {
        if (err) {
          console.error('Error counting correct match answers:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        const correctMatchCount = results[0].correctMatchCount;
        const message = `Total Score: ${score}, Correct Match Count: ${correctMatchCount}`;

        res.json({ message });
      });
    });
  });

  return router;
};
