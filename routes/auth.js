const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models');

router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/assets');
  }
  res.render('auth/login', { error: null });
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.User.findOne({ where: { username } });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.render('auth/login', { error: 'Invalid username or password' });
    }

    req.session.userId = user.id;
    req.session.user = { id: user.id, name: user.name, username: user.username };
    res.redirect('/assets');
  } catch (error) {
    res.render('auth/login', { error: 'An error occurred' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
