"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class userPictures extends Model {
    static associate(models) {
      userPictures.belongsTo(models.users, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }
  userPictures.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
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
      modelName: "userPictures",
      tableName: "userPictures",
      timestamps: true,
    }
  );
  return userPictures;
};
