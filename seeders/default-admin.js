const bcrypt = require('bcryptjs');
const db = require('../models');

async function seedAdmin() {
  try {
    const existingAdmin = await db.User.findOne({ where: { username: 'admin' } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.User.create({
        username: 'admin',
        password: hashedPassword,
        name: 'Administrator'
      });
      console.log('Default admin user created (admin/admin123)');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

module.exports = seedAdmin;
