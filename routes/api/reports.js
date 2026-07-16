const express = require('express');
const router = express.Router();
const db = require('../../models');
const { isAuthenticatedApi } = require('../../middleware/auth');

router.use(isAuthenticatedApi);

/**
 * @swagger
 * /api/reports/stock:
 *   get:
 *     summary: Get stock view — assets in stock grouped by category
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Stock summary
 */
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

    res.json({ assets, categoryTotals, totalCount: assets.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/reports/asset-history/{asset_id}:
 *   get:
 *     summary: Get full history of an asset
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Asset history timeline
 */
router.get('/asset-history/:asset_id', async (req, res) => {
  try {
    const { asset_id } = req.params;
    const asset = await db.Asset.findByPk(asset_id, {
      include: [{ model: db.AssetCategory, as: 'category' }]
    });

    if (!asset) return res.status(404).json({ error: 'Asset not found' });

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

    res.json({ asset, assignments, scrap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
