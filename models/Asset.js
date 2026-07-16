module.exports = (sequelize, Sequelize) => {
  const Asset = sequelize.define('Asset', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    serial_number: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    asset_category_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'asset_categories',
        key: 'id'
      }
    },
    make: {
      type: Sequelize.STRING
    },
    model: {
      type: Sequelize.STRING
    },
    warranty_expiry_date: {
      type: Sequelize.DATEONLY
    },
    condition: {
      type: Sequelize.ENUM('New', 'Good', 'Fair', 'Poor'),
      defaultValue: 'New'
    },
    status: {
      type: Sequelize.ENUM('In Stock', 'Issued', 'Scrapped'),
      defaultValue: 'In Stock'
    },
    notes: {
      type: Sequelize.TEXT
    }
  }, {
    tableName: 'assets',
    underscored: true
  });

  return Asset;
};
