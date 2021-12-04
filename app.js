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
    password: '$2b$10$ynW93qn4hMvhH/6iZwz1PennR3jRV3bBrciCyT9jvKpI5dqCc146S',
    isAdmin: true,
  },
]; //{email, name, password, isAdmin}
const INFORMATION = [
  {
    email: 'admin@email.com',
    info: `name: admin, isAdmin:true info`,
  },
]; //{email, info}
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
    INFORMATION.push({ email, info: `${name} info` });
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
    const token = authorization.split(' ')[1];
    const user = jwt.verify(token, secret);
    res.send([{ valid: true }]);
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
    const user = jwt.verify(token, secret);
    const accessToken = jwt.sign({ name: user.name }, secret, {
      expiresIn: '10s',
    });
    res.send({ accessToken });
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
app.get('/api/v1/information', (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).send('Access Token Required');
    return;
  }
  try {
    const token = authorization.split(' ')[1];
    const user = jwt.verify(token, secret);
    const { email } = USERS.find(({ name }) => name === user.name);
    // const info = INFORMATION.find((userInfo) => userInfo.email === email);
    res.send([INFORMATION.find((userInfo) => userInfo.email === email)]);
  } catch (error) {
    res.status(403).send('Invalid Access Token');
  }
});
app.get('/api/v1/users', (req, res) => {
  const { authorization } = req.headers;
  console.log(authorization);
  if (!authorization) {
    res.status(401).send('Access Token Required');
    return;
  }
  try {
    const token = authorization.split(' ')[1];
    const userFromToken = jwt.verify(token, secret);
    const user = USERS.find(({ name }) => name === userFromToken.name);
    if (user.isAdmin) {
      res.send(USERS);
    } else {
      res.status(401).send('Admin Only');
    }
  } catch (error) {
    res.status(403).send('Invalid Access Token');
  }
});

const OPTIONS = [
  {
    method: 'post',
    path: '/users/register',
    description: 'Register, Required: email, name, password',
    example: {
      body: { email: 'user@email.com', name: 'user', password: 'password' },
    },
  },
  {
    method: 'post',
    path: '/users/login',
    description: 'Login, Required: valid email and password',
    example: { body: { email: 'user@email.com', password: 'password' } },
  },
  {
    method: 'post',
    path: '/users/token',
    description: 'Renew access token, Required: valid refresh token',
    example: { headers: { token: '*Refresh Token*' } },
  },
  {
    method: 'post',
    path: '/users/tokenValidate',
    description: 'Access Token Validation, Required: valid access token',
    example: { headers: { Authorization: 'Bearer *Access Token*' } },
  },
  {
    method: 'get',
    path: '/api/v1/information',
    description: "Access user's information, Required: valid access token",
    example: { headers: { Authorization: 'Bearer *Access Token*' } },
  },
  {
    method: 'post',
    path: '/users/logout',
    description: 'Logout, Required: access token',
    example: { body: { token: '*Refresh Token*' } },
  },
  {
    method: 'get',
    path: 'api/v1/users',
    description: 'Get users DB, Required: Valid access token of admin user',
    example: { headers: { authorization: 'Bearer *Access Token*' } },
  },
];

app.options('/', (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.setHeader({ Allow: 'OPTIONS, POST' });

    res.send(OPTIONS.slice(0, 1));
    return;
  }
  try {
    const token = authorization.split(' ')[1];
    const username = jwt.verify(token, secret);
    console.log(username);
    const user = USERS.find(({ name }) => name === username);
    if (user.isAdmin) {
      res.setHeader({ Allow: 'OPTIONS, GET, POST' });
      res.send(OPTIONS);
    } else {
      res.setHeader({ Allow: 'OPTIONS, GET, POST' });
      res.send(OPTIONS.slice(0, 5));
    }
  } catch (error) {
    res.setHeader({ Allow: 'OPTIONS, POST' });
    res.send(OPTIONS.slice(0, 2));
  }
});

// app.use('*', (req, res) => {
//   res.status(404).send('unknown endpoint');
// });
app.use((err, req, res, next) => {
  res.status(404).send('unknown endpoint');
});

module.exports = app;
