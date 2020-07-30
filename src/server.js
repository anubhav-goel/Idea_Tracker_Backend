const express = require('express');
const cors = require('cors');
require('custom-env').env(true);
const user = require('./routes/user');
const auth = require('./routes/auth');
const idea = require('./routes/idea');
const ideaStatus = require('./routes/ideaStatus');
const api = require('./routes/api');
const connectDB = require('./config/db');
const settings = process.env;
const app = express();
//Connect to database
connectDB(settings);

app.use(express.json({ extended: true }));
app.use(cors({
	origin: '*'
  }));

//Define routes
app.use('/api', api);
app.use('/api/user', user);
app.use('/auth', auth);
app.use('/api/idea', idea);
app.use('/api/ideaStatus', ideaStatus);


const PORT = settings.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}..`);
});
