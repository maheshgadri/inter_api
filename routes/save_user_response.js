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

//   router.post('/saveUserResponse', (req, res) => {
//     const { user_id, question_id, selected_option } = req.body;

//     if (!user_id || !question_id || !selected_option) {
//       return res.status(400).json({ error: 'user_id, question_id, and selected_option are required' });
//     }

//     // Insert user response into MySQL database
//     const query = 'INSERT INTO user_responses (user_id, question_id, selected_option) VALUES (?, ?, ?)';
//     const values = [user_id, question_id, selected_option];

//     connection.query(query, values, (err, result) => {
//       if (err) {
//         console.error('Error inserting user response into database:', err);
//         return res.status(500).json({ error: 'Database insertion failed' });
//       }
//       console.log('User response inserted into database:', result);
//       return res.status(200).json({ success: 'User response inserted successfully', result });
//     });
//   });

//   return router;
// };


router.post('/saveUserResponse', (req, res) => {
  const { user_id, question_text, selected_option } = req.body;

  if (!user_id || !question_text || !selected_option) {
    return res.status(400).json({ error: 'user_id, question_text, and selected_option are required' });
  }

  // Check if the question_text exists in the destination_openai_response table
  const checkQuestionQuery = 'SELECT id FROM destination_openai_response WHERE question_text = ?';
  connection.query(checkQuestionQuery, [question_text], (checkQuestionErr, checkQuestionResult) => {
    if (checkQuestionErr) {
      console.error('Error checking for existing question:', checkQuestionErr);
      return res.status(500).json({ error: 'Database query failed' });
    }

    if (checkQuestionResult.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const question_id = checkQuestionResult[0].id;

    // Proceed to insert/update the user response
    const checkUserResponseQuery = 'SELECT * FROM user_responses WHERE user_id = ? AND question_id = ?';
    connection.query(checkUserResponseQuery, [user_id, question_id], (checkResponseErr, checkResponseResult) => {
      if (checkResponseErr) {
        console.error('Error checking for existing user response:', checkResponseErr);
        return res.status(500).json({ error: 'Database query failed' });
      }

      if (checkResponseResult.length > 0) {
        // If the response exists, update it
        const updateQuery = 'UPDATE user_responses SET selected_option = ? WHERE user_id = ? AND question_id = ?';
        const updateValues = [selected_option, user_id, question_id];

        connection.query(updateQuery, updateValues, (updateErr, updateResult) => {
          if (updateErr) {
            console.error('Error updating user response in database:', updateErr);
            return res.status(500).json({ error: 'Database update failed' });
          }
          console.log('User response updated in database:', updateResult);
          return res.status(200).json({ success: 'User response updated successfully', result: updateResult });
        });
      } else {
        // If the response does not exist, insert a new one
        const insertQuery = 'INSERT INTO user_responses (user_id, question_id, selected_option) VALUES (?, ?, ?)';
        const insertValues = [user_id, question_id, selected_option];

        connection.query(insertQuery, insertValues, (insertErr, insertResult) => {
          if (insertErr) {
            console.error('Error inserting user response into database:', insertErr);
            return res.status(500).json({ error: 'Database insertion failed' });
          }
          console.log('User response inserted into database:', insertResult);
          return res.status(200).json({ success: 'User response inserted successfully', result: insertResult });
        });
      }
    });
  });
});

return router;

};
