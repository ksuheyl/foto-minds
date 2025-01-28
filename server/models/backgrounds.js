const bcrypt = require("bcrypt");
const { Model, DataTypes } = require("sequelize");

("use strict");
module.exports = (sequelize, DataTypes) => {
  class backgrounds extends Model {
    static associate(models) {
      backgrounds.hasMany(models.picture, { foreignKey: "userId", as: "pictures" });
    }
  }
  backgrounds.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      backgroundName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "backgrounds",
      timestamps: true,
    }
  );

  return backgrounds;
};
