const express = require('express');
const router = express.Router();
const db = require('../models');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/new', async (req, res) => {
  try {
    const assets = await db.Asset.findAll({
      where: { status: ['In Stock', 'Issued'] },
      include: [{ model: db.AssetCategory, as: 'category' }],
      order: [['name', 'ASC']]
    });
    res.render('scraps/new', { assets, success: req.query.success });
  } catch (error) {
    res.render('scraps/new', { assets: [], error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { asset_id, scrap_date, reason, notes } = req.body;

    await db.AssetScrap.create({
      asset_id,
      scrapped_by: req.session.userId,
      scrap_date,
      reason,
      notes
    });

    const openAssignment = await db.AssetAssignment.findOne({
      where: { asset_id, return_date: null }
    });
    if (openAssignment) {
      await openAssignment.update({
        return_date: scrap_date,
        return_reason: 'Other',
        returned_by: req.session.userId,
        notes: 'Auto-returned due to scrap'
      });
    }

    await db.Asset.update({ status: 'Scrapped' }, { where: { id: asset_id } });

    res.redirect('/scraps/new?success=Asset scrapped successfully');
  } catch (error) {
    const assets = await db.Asset.findAll({
      where: { status: ['In Stock', 'Issued'] },
      include: [{ model: db.AssetCategory, as: 'category' }],
      order: [['name', 'ASC']]
    });
    res.render('scraps/new', { assets, error: error.message });
  }
});

module.exports = router;
