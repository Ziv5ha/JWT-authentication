const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secret = 'MaDpesset';

const express = require('express');
require('dotenv').config();
const cors = require('cors');
// const userRouter = require('./routers/userRouter');
// const apiRouter = require('./routers/apiRouter');
const app = express();

app.use(cors());
app.use(express.json());

const USERS = [
  {
    email: 'admin@email.com',
    name: 'admin',
    password: 'PLACEHOLDER',
    isAdmin: true,
  },
]; //{email, name, password, isAdmin}
const INFORMATION = []; //{email, info}
const REFRESHTOKENS = [];

/////// Users ///////
// app.use('/users', userRouter);
app.post('/users/register', async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    USERS.forEach((user) => {
      if (user.email === email) {
        res.status(409).send('user already exists');
        throw 'user already exists';
      }
    });
    const hashedPassword = await bcrypt.hash(password, 10);
    USERS.push({ email, name, password: hashedPassword });
    res.status(201).send('Register Success');
  } catch (error) {
    res.status(500).send();
  }
});

app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find((user) => user.email === email);
  if (!user) {
    res.status(404).send('cannot find use');
  }
  try {
    if (await bcrypt.compare(password, user.password)) {
      const accessToken = jwt.sign({ name: user.name }, secret, {
        expiresIn: '10s',
      });
      const refreshToken = jwt.sign({ name: user.name }, secret);
      REFRESHTOKENS.push(refreshToken);
      res.send({
        accessToken,
        refreshToken,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin ? true : false,
      });
    } else {
      res.status(403).send('User or Password incorrect');
    }
  } catch (error) {}
});

app.post('/users/tokenValidate', (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).send('Access Token Required');
    return;
  }
  try {
    const user = jwt.verify(authorization, secret);
    res.send({ valid: true });
  } catch (error) {
    res.status(403).send('Invalid Access Token');
  }
});
app.post('/users/token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(401).send('Refresh Token Required');
    return;
  }
  try {
    const user = jwt.verify(authorization, secret);
    const accessToken = jwt.sign(user, secret, { expiresIn: '10s' });
    res.send(accessToken);
  } catch (error) {
    res.status(403).send('Invalid Refresh Token');
  }
});
app.post('/users/logout', (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(400).send('Refresh Token Required');
    return;
  }
  try {
    REFRESHTOKENS.splice(REFRESHTOKENS.indexOf(token), 1);
    res.send('User Logged Out Successfully');
  } catch (error) {
    res.status(400).send('Invalid Refresh Token');
  }
});

/////// api/v1 ///////
// app.use('/api/v1', apiRouter);
app.post('/information', (req, res) => {});
app.post('/users', (req, res) => {});

app.use((err, req, res, next) => {
  res.status(404).send('unknown endpoint');
});

module.exports = app;
