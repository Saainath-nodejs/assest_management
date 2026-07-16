module.exports = (sequelize, Sequelize) => {
  const AssetAssignment = sequelize.define('AssetAssignment', {
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
    employee_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    issued_by: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    issue_date: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    return_date: {
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    return_reason: {
      type: Sequelize.ENUM('Upgrade', 'Repair', 'Resignation', 'Transfer', 'Damaged', 'Other'),
      allowNull: true
    },
    returned_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    notes: {
      type: Sequelize.TEXT
    }
  }, {
    tableName: 'asset_assignments',
    underscored: true
  });

  return AssetAssignment;
};
