"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class picture extends Model {
    static associate(models) {}
  }
  picture.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "picture",
      tableName: "picture",
      timestamps: true,
    }
  );
  return picture;
};
