const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.User = require('./User')(sequelize, Sequelize);
db.Employee = require('./Employee')(sequelize, Sequelize);
db.AssetCategory = require('./AssetCategory')(sequelize, Sequelize);
db.Asset = require('./Asset')(sequelize, Sequelize);
db.AssetAssignment = require('./AssetAssignment')(sequelize, Sequelize);
db.AssetScrap = require('./AssetScrap')(sequelize, Sequelize);

// Associations
db.Asset.belongsTo(db.AssetCategory, { foreignKey: 'asset_category_id', as: 'category' });
db.AssetCategory.hasMany(db.Asset, { foreignKey: 'asset_category_id', as: 'assets' });

db.AssetAssignment.belongsTo(db.Asset, { foreignKey: 'asset_id', as: 'asset' });
db.AssetAssignment.belongsTo(db.Employee, { foreignKey: 'employee_id', as: 'employee' });
db.AssetAssignment.belongsTo(db.User, { foreignKey: 'issued_by', as: 'issuedByUser' });
db.AssetAssignment.belongsTo(db.User, { foreignKey: 'returned_by', as: 'returnedByUser' });

db.Asset.hasMany(db.AssetAssignment, { foreignKey: 'asset_id', as: 'assignments' });
db.Employee.hasMany(db.AssetAssignment, { foreignKey: 'employee_id', as: 'assignments' });

db.AssetScrap.belongsTo(db.Asset, { foreignKey: 'asset_id', as: 'asset' });
db.AssetScrap.belongsTo(db.User, { foreignKey: 'scrapped_by', as: 'scrappedByUser' });
db.Asset.hasOne(db.AssetScrap, { foreignKey: 'asset_id', as: 'scrap' });

module.exports = db;
