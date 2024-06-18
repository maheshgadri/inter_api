const express = require('express');
const ngrok = require('ngrok');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const port1 = 3002; // Changed port for des_open_ai_response
const port2 = 3003; // Changed port for fetch_route

// Initialize ngrok
let ngrokUrl = '';

// Start ngrok for port1
ngrok.connect(port1).then(url => {
  ngrokUrl = url;
  console.log(`Ngrok Tunnel in: ${ngrokUrl}`);
  
  // Start the server after ngrok is initialized
  app.listen(port1, () => {
    console.log(`Server is running on port ${port1}`);
    console.log(`Server is running on port ${ngrokUrl}`);
  });

  // Pass ngrokUrl to router
  const desOpenAiResponseRouter = require('./routes/des_open_ai_response')(ngrokUrl);
  const fetchRouteRouter = require('./routes/fetch_route');
  const saveUserResponseRouter = require('./routes/save_user_response')(ngrokUrl);
  const scoreRouteRouter = require('./routes/score');
  const loginRouter = require('./routes/login')(ngrokUrl);
  const signupRouter = require('./routes/signup');
  const profile_fetchRouter = require('./routes/profile_fetch')(ngrokUrl);

  app.use('/des_open_ai_response', desOpenAiResponseRouter);
  app.use('/fetch_route', fetchRouteRouter(ngrokUrl));
  app.use('/save_user_response',saveUserResponseRouter);
  app.use('/score', scoreRouteRouter(ngrokUrl));
  app.use('/login', loginRouter); // Add this line
  app.use('/signup', signupRouter(ngrokUrl));
  app.use('/profile_fetch',profile_fetchRouter);
  
}).catch(error => {
  console.log(`Couldn't tunnel ngrok: ${error}`);
});

module.exports = app;
