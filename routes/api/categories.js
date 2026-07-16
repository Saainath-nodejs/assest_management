const express = require('express');
const router = express.Router();
const db = require('../../models');
const { isAuthenticatedApi } = require('../../middleware/auth');

router.use(isAuthenticatedApi);

/**
 * @swagger
 * components:
 *   schemas:
 *     AssetCategory:
 *       type: object
 *       required: [name]
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all asset categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', async (req, res) => {
  try {
    const categories = await db.AssetCategory.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssetCategory'
 *     responses:
 *       201:
 *         description: Category created
 */
router.post('/', async (req, res) => {
  try {
    const category = await db.AssetCategory.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
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
 *             $ref: '#/components/schemas/AssetCategory'
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await db.AssetCategory.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    const category = await db.AssetCategory.findByPk(req.params.id);
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
