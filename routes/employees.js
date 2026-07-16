const express = require('express');
const router = express.Router();
const db = require('../models');
const { isAuthenticated } = require('../middleware/auth');
const { Op } = require('sequelize');

router.use(isAuthenticated);

router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { employee_code: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } },
        { branch: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const employees = await db.Employee.findAll({ where, order: [['name', 'ASC']] });
    res.render('employees/index', { employees, filters: { status, search } });
  } catch (error) {
    res.render('employees/index', { employees: [], filters: {}, error: error.message });
  }
});

router.get('/add', (req, res) => {
  res.render('employees/form', { employee: null, action: '/employees', method: 'POST' });
});

router.post('/', async (req, res) => {
  try {
    await db.Employee.create(req.body);
    res.redirect('/employees');
  } catch (error) {
    res.render('employees/form', { employee: req.body, action: '/employees', method: 'POST', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const employee = await db.Employee.findByPk(req.params.id);
    if (!employee) return res.redirect('/employees');

    const assignments = await db.AssetAssignment.findAll({
      where: { employee_id: employee.id },
      include: [{ model: db.Asset, as: 'asset', include: [{ model: db.AssetCategory, as: 'category' }] }],
      order: [['issue_date', 'DESC']]
    });

    res.render('employees/view', { employee, assignments });
  } catch (error) {
    res.redirect('/employees');
  }
});

router.get('/:id/edit', async (req, res) => {
  try {
    const employee = await db.Employee.findByPk(req.params.id);
    if (!employee) return res.redirect('/employees');
    res.render('employees/form', { employee, action: `/employees/${employee.id}?_method=PUT`, method: 'POST' });
  } catch (error) {
    res.redirect('/employees');
  }
});

router.put('/:id', async (req, res) => {
  try {
    await db.Employee.update(req.body, { where: { id: req.params.id } });
    res.redirect('/employees');
  } catch (error) {
    const employee = { ...req.body, id: req.params.id };
    res.render('employees/form', { employee, action: `/employees/${req.params.id}?_method=PUT`, method: 'POST', error: error.message });
  }
});

module.exports = router;
