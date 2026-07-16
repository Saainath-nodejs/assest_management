const express = require('express');
const router = express.Router();
const db = require('../../models');
const { isAuthenticatedApi } = require('../../middleware/auth');

router.use(isAuthenticatedApi);

/**
 * @swagger
 * /api/assignments/issue:
 *   post:
 *     summary: Issue an asset to an employee
 *     tags: [Assignments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [asset_id, employee_id, issue_date]
 *             properties:
 *               asset_id:
 *                 type: integer
 *               employee_id:
 *                 type: integer
 *               issue_date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Asset issued
 */
router.post('/issue', async (req, res) => {
  try {
    const { asset_id, employee_id, issue_date, notes } = req.body;

    const asset = await db.Asset.findByPk(asset_id);
    if (!asset || asset.status !== 'In Stock') {
      return res.status(400).json({ error: 'Asset is not available for issue' });
    }

    const assignment = await db.AssetAssignment.create({
      asset_id,
      employee_id,
      issued_by: req.session.userId,
      issue_date,
      notes
    });

    await db.Asset.update({ status: 'Issued' }, { where: { id: asset_id } });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/assignments/return:
 *   post:
 *     summary: Return an asset from an employee
 *     tags: [Assignments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignment_id, return_date, return_reason]
 *             properties:
 *               assignment_id:
 *                 type: integer
 *               return_date:
 *                 type: string
 *                 format: date
 *               return_reason:
 *                 type: string
 *                 enum: [Upgrade, Repair, Resignation, Transfer, Damaged, Other]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Asset returned
 */
router.post('/return', async (req, res) => {
  try {
    const { assignment_id, return_date, return_reason, notes } = req.body;

    const assignment = await db.AssetAssignment.findByPk(assignment_id);
    if (!assignment || assignment.return_date) {
      return res.status(400).json({ error: 'Invalid assignment or already returned' });
    }

    await assignment.update({
      return_date,
      return_reason,
      returned_by: req.session.userId,
      notes
    });

    await db.Asset.update({ status: 'In Stock' }, { where: { id: assignment.asset_id } });
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Get all assignments
 *     tags: [Assignments]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: If true, only currently issued (not returned)
 *     responses:
 *       200:
 *         description: List of assignments
 */
router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.active === 'true') where.return_date = null;

    const assignments = await db.AssetAssignment.findAll({
      where,
      include: [
        { model: db.Asset, as: 'asset', include: [{ model: db.AssetCategory, as: 'category' }] },
        { model: db.Employee, as: 'employee' },
        { model: db.User, as: 'issuedByUser' },
        { model: db.User, as: 'returnedByUser' }
      ],
      order: [['issue_date', 'DESC']]
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
