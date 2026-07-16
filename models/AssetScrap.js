module.exports = (sequelize, Sequelize) => {
  const AssetScrap = sequelize.define('AssetScrap', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    asset_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'assets',
        key: 'id'
      }
    },
    scrapped_by: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    scrap_date: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    reason: {
      type: Sequelize.TEXT
    },
    notes: {
      type: Sequelize.TEXT
    }
  }, {
    tableName: 'asset_scraps',
    underscored: true
  });

  return AssetScrap;
};
