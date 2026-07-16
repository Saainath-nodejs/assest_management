const express = require('express');
const router = express.Router();
const db = require('../models');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/issue', async (req, res) => {
  try {
    const employees = await db.Employee.findAll({ where: { status: 'active' }, order: [['name', 'ASC']] });
    const assets = await db.Asset.findAll({
      where: { status: 'In Stock' },
      include: [{ model: db.AssetCategory, as: 'category' }],
      order: [['name', 'ASC']]
    });
    res.render('assignments/issue', { employees, assets, success: req.query.success });
  } catch (error) {
    res.render('assignments/issue', { employees: [], assets: [], error: error.message });
  }
});

router.post('/issue', async (req, res) => {
  try {
    const { asset_id, employee_id, issue_date, notes } = req.body;

    await db.AssetAssignment.create({
      asset_id,
      employee_id,
      issued_by: req.session.userId,
      issue_date,
      notes
    });

    await db.Asset.update({ status: 'Issued' }, { where: { id: asset_id } });

    res.redirect('/assignments/issue?success=Asset issued successfully');
  } catch (error) {
    const employees = await db.Employee.findAll({ where: { status: 'active' }, order: [['name', 'ASC']] });
    const assets = await db.Asset.findAll({ where: { status: 'In Stock' }, order: [['name', 'ASC']] });
    res.render('assignments/issue', { employees, assets, error: error.message });
  }
});

router.get('/return', async (req, res) => {
  try {
    const assignments = await db.AssetAssignment.findAll({
      where: { return_date: null },
      include: [
        { model: db.Asset, as: 'asset', include: [{ model: db.AssetCategory, as: 'category' }] },
        { model: db.Employee, as: 'employee' }
      ],
      order: [['issue_date', 'DESC']]
    });
    res.render('assignments/return', { assignments, success: req.query.success });
  } catch (error) {
    res.render('assignments/return', { assignments: [], error: error.message });
  }
});

router.post('/return', async (req, res) => {
  try {
    const { assignment_id, return_date, return_reason, notes } = req.body;

    const assignment = await db.AssetAssignment.findByPk(assignment_id);
    if (!assignment) throw new Error('Assignment not found');

    await assignment.update({
      return_date,
      return_reason,
      returned_by: req.session.userId,
      notes: notes || assignment.notes
    });

    await db.Asset.update({ status: 'In Stock' }, { where: { id: assignment.asset_id } });

    res.redirect('/assignments/return?success=Asset returned successfully');
  } catch (error) {
    const assignments = await db.AssetAssignment.findAll({
      where: { return_date: null },
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.Employee, as: 'employee' }
      ]
    });
    res.render('assignments/return', { assignments, error: error.message });
  }
});

module.exports = router;
