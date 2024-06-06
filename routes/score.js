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
    const userId = req.query.user_id;  // Assuming you pass user_id as a query parameter
    // const userId = 1; 
    if (!userId) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const scoreQuery = `
      SELECT
        COUNT(*) AS totalAnswered,
        SUM(CASE WHEN dor.answer = ur.selected_option THEN 1 ELSE 0 END) AS correctMatchCount
      FROM user_responses ur
      JOIN destination_openai_response dor
        ON dor.id = ur.question_id
        AND ur.user_id = ?
        AND dor.user_id = ur.user_id;
    `;

    connection.query(scoreQuery, [userId], (err, results) => {
      if (err) {
   
        console.error('Error calculating score:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'No data found' });
      }

      const totalAnswered = results[0].totalAnswered;
      const correctMatchCount = results[0].correctMatchCount;

      const message = `Total Answered: ${totalAnswered}, Correct Answered Count: ${correctMatchCount}`;

      res.json({ message });
    });
  });

  return router;
};