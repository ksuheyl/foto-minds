const bcrypt = require("bcrypt");
const { Model, DataTypes } = require("sequelize");

("use strict");
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    static associate(models) {
      users.hasMany(models.userPictures, { foreignKey: "userId", as: "pictures" });
    }
  }
  users.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("admin", "user"),
        defaultValue: "user",
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "active",
      },
      resetToken: {
        type: DataTypes.STRING,
      },
      resetTokenExpire: {
        type: DataTypes.DATE,
      },
      profilePicture: {
        type: DataTypes.STRING,
      },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
      defaultScope: {
        attributes: { exclude: ["password"] },
      },
      scopes: {
        withPassword: { attributes: {} },
      },
      sequelize,
      modelName: "users",
      timestamps: true,
    }
  );

  return users;
};
