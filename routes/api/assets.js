const express = require('express');
const router = express.Router();
const db = require('../../models');
const { isAuthenticatedApi } = require('../../middleware/auth');
const { Op } = require('sequelize');

router.use(isAuthenticatedApi);

/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       required: [serial_number, name, asset_category_id]
 *       properties:
 *         id:
 *           type: integer
 *         serial_number:
 *           type: string
 *         name:
 *           type: string
 *         asset_category_id:
 *           type: integer
 *         make:
 *           type: string
 *         model:
 *           type: string
 *         warranty_expiry_date:
 *           type: string
 *           format: date
 *         condition:
 *           type: string
 *           enum: [New, Good, Fair, Poor]
 *         status:
 *           type: string
 *           enum: [In Stock, Issued, Scrapped]
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: Get all assets
 *     tags: [Assets]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [In Stock, Issued, Scrapped, all]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of assets
 */
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
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: Create asset
 *     tags: [Assets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Asset'
 *     responses:
 *       201:
 *         description: Asset created
 */
router.post('/', async (req, res) => {
  try {
    const asset = await db.Asset.create(req.body);
    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Get asset by ID
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Asset details
 */
router.get('/:id', async (req, res) => {
  try {
    const asset = await db.Asset.findByPk(req.params.id, {
      include: [{ model: db.AssetCategory, as: 'category' }]
    });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/assets/{id}:
 *   put:
 *     summary: Update asset
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Asset'
 *     responses:
 *       200:
 *         description: Asset updated
 */
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await db.Asset.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Asset not found' });
    const asset = await db.Asset.findByPk(req.params.id, {
      include: [{ model: db.AssetCategory, as: 'category' }]
    });
    res.json(asset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
