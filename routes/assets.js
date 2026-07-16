const express = require('express');
const router = express.Router();
const db = require('../models');
const { isAuthenticated } = require('../middleware/auth');
const { Op } = require('sequelize');

router.use(isAuthenticated);

router.get('/', async (req, res) => {
  try {
    const { category, search, status } = req.query;
    const where = {};

    if (category) where.asset_category_id = category;
    if (status && status !== 'all') where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { serial_number: { [Op.iLike]: `%${search}%` } },
        { make: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const assets = await db.Asset.findAll({
      where,
      include: [{ model: db.AssetCategory, as: 'category' }],
      order: [['name', 'ASC']]
    });
    const categories = await db.AssetCategory.findAll({ order: [['name', 'ASC']] });

    res.render('assets/index', { assets, categories, filters: { category, search, status } });
  } catch (error) {
    res.render('assets/index', { assets: [], categories: [], filters: {}, error: error.message });
  }
});

router.get('/add', async (req, res) => {
  const categories = await db.AssetCategory.findAll({ order: [['name', 'ASC']] });
  res.render('assets/form', { asset: null, categories, action: '/assets', method: 'POST' });
});

router.post('/', async (req, res) => {
  try {
    await db.Asset.create(req.body);
    res.redirect('/assets');
  } catch (error) {
    const categories = await db.AssetCategory.findAll({ order: [['name', 'ASC']] });
    res.render('assets/form', { asset: req.body, categories, action: '/assets', method: 'POST', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const asset = await db.Asset.findByPk(req.params.id, {
      include: [{ model: db.AssetCategory, as: 'category' }]
    });
    if (!asset) return res.redirect('/assets');

    const assignments = await db.AssetAssignment.findAll({
      where: { asset_id: asset.id },
      include: [
        { model: db.Employee, as: 'employee' },
        { model: db.User, as: 'issuedByUser' },
        { model: db.User, as: 'returnedByUser' }
      ],
      order: [['issue_date', 'DESC']]
    });

    const scrap = await db.AssetScrap.findOne({
      where: { asset_id: asset.id },
      include: [{ model: db.User, as: 'scrappedByUser' }]
    });

    res.render('assets/view', { asset, assignments, scrap });
  } catch (error) {
    res.redirect('/assets');
  }
});

router.get('/:id/edit', async (req, res) => {
  try {
    const asset = await db.Asset.findByPk(req.params.id);
    if (!asset) return res.redirect('/assets');
    const categories = await db.AssetCategory.findAll({ order: [['name', 'ASC']] });
    res.render('assets/form', { asset, categories, action: `/assets/${asset.id}?_method=PUT`, method: 'POST' });
  } catch (error) {
    res.redirect('/assets');
  }
});

router.put('/:id', async (req, res) => {
  try {
    await db.Asset.update(req.body, { where: { id: req.params.id } });
    res.redirect('/assets');
  } catch (error) {
    const categories = await db.AssetCategory.findAll({ order: [['name', 'ASC']] });
    const asset = { ...req.body, id: req.params.id };
    res.render('assets/form', { asset, categories, action: `/assets/${req.params.id}?_method=PUT`, method: 'POST', error: error.message });
  }
});

module.exports = router;
