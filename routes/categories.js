const express = require('express');
const router = express.Router();
const db = require('../models');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', async (req, res) => {
  try {
    const categories = await db.AssetCategory.findAll({ order: [['name', 'ASC']] });
    res.render('categories/index', { categories });
  } catch (error) {
    res.render('categories/index', { categories: [], error: error.message });
  }
});

router.get('/add', (req, res) => {
  res.render('categories/form', { category: null, action: '/categories', method: 'POST' });
});

router.post('/', async (req, res) => {
  try {
    await db.AssetCategory.create(req.body);
    res.redirect('/categories');
  } catch (error) {
    res.render('categories/form', { category: req.body, action: '/categories', method: 'POST', error: error.message });
  }
});

router.get('/:id/edit', async (req, res) => {
  try {
    const category = await db.AssetCategory.findByPk(req.params.id);
    if (!category) return res.redirect('/categories');
    res.render('categories/form', { category, action: `/categories/${category.id}?_method=PUT`, method: 'POST' });
  } catch (error) {
    res.redirect('/categories');
  }
});

router.put('/:id', async (req, res) => {
  try {
    await db.AssetCategory.update(req.body, { where: { id: req.params.id } });
    res.redirect('/categories');
  } catch (error) {
    const category = { ...req.body, id: req.params.id };
    res.render('categories/form', { category, action: `/categories/${req.params.id}?_method=PUT`, method: 'POST', error: error.message });
  }
});

module.exports = router;
