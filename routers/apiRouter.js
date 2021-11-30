// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');

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

router.post('/information', (req, res) => {});
router.post('/users', (req, res) => {});

module.exports = router;
