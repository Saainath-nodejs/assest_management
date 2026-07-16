module.exports = (sequelize, Sequelize) => {
  const AssetCategory = sequelize.define('AssetCategory', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: Sequelize.TEXT
    }
  }, {
    tableName: 'asset_categories',
    underscored: true
  });

  return AssetCategory;
};
