const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const express = require('express');
const router = express.Router();
// router.use(express.json())

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

router.post('/register', async (req, res, next) => {
  const { email, user, password } = req.body;
  USERS.forEach((user) => {
    if (user.email === email) {
      res.status(409).send('user already exists');
      return;
    }
  });
  const hashedPassword = await bcrypt.hash(password, 10);
  USERS.push({ email, user, hashedPassword });
  res.status(201).send('Register Success');
});

module.exports = router;
