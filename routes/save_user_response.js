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
  const { user_id, question_id, selected_option } = req.body;

  if (!user_id || !question_id || !selected_option) {
    return res.status(400).json({ error: 'user_id, question_id, and selected_option are required' });
  }

  // Check if the user response already exists in the database
  const checkQuery = 'SELECT * FROM user_responses WHERE user_id = ? AND question_id = ?';
  const checkValues = [user_id, question_id];

  connection.query(checkQuery, checkValues, (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking for existing user response:', checkErr);
      return res.status(500).json({ error: 'Database query failed' });
    }

    if (checkResult.length > 0) {
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

return router;
};
