const express = require('express');
const router = express.Router();
const db = require('../../models');
const { isAuthenticatedApi } = require('../../middleware/auth');

router.use(isAuthenticatedApi);

/**
 * @swagger
 * /api/scraps:
 *   post:
 *     summary: Scrap an asset
 *     tags: [Scraps]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [asset_id, scrap_date]
 *             properties:
 *               asset_id:
 *                 type: integer
 *               scrap_date:
 *                 type: string
 *                 format: date
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Asset scrapped
 */
router.post('/', async (req, res) => {
  try {
    const { asset_id, scrap_date, reason, notes } = req.body;

    const asset = await db.Asset.findByPk(asset_id);
    if (!asset || asset.status === 'Scrapped') {
      return res.status(400).json({ error: 'Asset is already scrapped or not found' });
    }

    const scrap = await db.AssetScrap.create({
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
    res.status(201).json(scrap);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
