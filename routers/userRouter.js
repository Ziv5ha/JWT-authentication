const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const express = require('express');
const router = express.Router();
// router.use(express.json())
const secret = 'MaDpesset';
const { USERS, INFORMATION, REFRESHTOKENS } = require('../app');

// const USERS = [
//   {
//     email: 'admin@email.com',
//     name: 'admin',
//     password: 'PLACEHOLDER',
//     isAdmin: true,
//   },
// ]; //{email, name, password, isAdmin}
// const INFORMATION = []; //{email, info}
// const REFRESHTOKENS = [];

router.post('/register', async (req, res, next) => {
  try {
    const { email, user, password } = req.body;
    USERS.forEach((user) => {
      if (user.email === email) {
        res.status(409).send('user already exists');
        throw 'user already exists';
      }
    });
    const hashedPassword = await bcrypt.hash(password, 10);
    USERS.push({ email, user, password: hashedPassword });
    console.log(USERS);
    res.status(201).send('Register Success');
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find((user) => user.email === email);
  if (!user) {
    res.status(404).send('cannot find use');
  }
  try {
    if (await bcrypt.compare(password, user.password)) {
      const accessToken = jwt.sign({ name: user.name }, secret);
      res.json({
        accessToken,
        refreshToken: 'printer',
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin ? true : false,
      });
    } else {
      res.status(403).send('User or Password incorrect');
    }
  } catch (error) {}
});

router.post('/tokenValidate', (req, res) => {});
router.post('/token', (req, res) => {});
router.post('/logout', (req, res) => {});

module.exports = router;
