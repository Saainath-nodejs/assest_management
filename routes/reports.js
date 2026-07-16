const express = require('express');
const router = express.Router();
const db = require('../models');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/stock', async (req, res) => {
  try {
    const assets = await db.Asset.findAll({
      where: { status: 'In Stock' },
      include: [{ model: db.AssetCategory, as: 'category' }],
      order: [['name', 'ASC']]
    });

    const categoryTotals = {};
    assets.forEach(asset => {
      const catName = asset.category ? asset.category.name : 'Uncategorized';
      if (!categoryTotals[catName]) categoryTotals[catName] = 0;
      categoryTotals[catName]++;
    });

    res.render('reports/stock', { assets, categoryTotals, totalCount: assets.length });
  } catch (error) {
    res.render('reports/stock', { assets: [], categoryTotals: {}, totalCount: 0, error: error.message });
  }
});

router.get('/asset-history', async (req, res) => {
  try {
    const { asset_id } = req.query;
    let asset = null;
    let history = [];

    const allAssets = await db.Asset.findAll({
      include: [{ model: db.AssetCategory, as: 'category' }],
      order: [['name', 'ASC']]
    });

    if (asset_id) {
      asset = await db.Asset.findByPk(asset_id, {
        include: [{ model: db.AssetCategory, as: 'category' }]
      });

      if (asset) {
        const assignments = await db.AssetAssignment.findAll({
          where: { asset_id },
          include: [
            { model: db.Employee, as: 'employee' },
            { model: db.User, as: 'issuedByUser' },
            { model: db.User, as: 'returnedByUser' }
          ],
          order: [['issue_date', 'ASC']]
        });

        const scrap = await db.AssetScrap.findOne({
          where: { asset_id },
          include: [{ model: db.User, as: 'scrappedByUser' }]
        });

        history.push({
          date: asset.created_at,
          event: 'Asset Created',
          details: `${asset.name} (${asset.serial_number}) added to inventory`,
          type: 'created'
        });

        assignments.forEach(a => {
          history.push({
            date: a.issue_date,
            event: 'Issued',
            details: `Issued to ${a.employee ? a.employee.name : 'Unknown'} by ${a.issuedByUser ? a.issuedByUser.name : 'Unknown'}`,
            type: 'issued'
          });
          if (a.return_date) {
            history.push({
              date: a.return_date,
              event: 'Returned',
              details: `Returned (${a.return_reason || 'N/A'}) by ${a.returnedByUser ? a.returnedByUser.name : 'Unknown'}`,
              type: 'returned'
            });
          }
        });

        if (scrap) {
          history.push({
            date: scrap.scrap_date,
            event: 'Scrapped',
            details: `Scrapped by ${scrap.scrappedByUser ? scrap.scrappedByUser.name : 'Unknown'}. Reason: ${scrap.reason || 'N/A'}`,
            type: 'scrapped'
          });
        }

        history.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
    }

    res.render('reports/asset-history', { allAssets, asset, history, selectedAssetId: asset_id });
  } catch (error) {
    res.render('reports/asset-history', { allAssets: [], asset: null, history: [], error: error.message });
  }
});

module.exports = router;
