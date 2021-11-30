const express = require('express');
require('dotenv').config();
const cors = require('cors');
const userRouter = require('./routers/userRouter');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', userRouter);

app.use('/', (req, res) => {
  res.status(404).send('unknown endpoint');
});

module.exports = app;
