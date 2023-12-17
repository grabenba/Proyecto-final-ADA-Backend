import { DataTypes, Model } from "sequelize";
const { STRING, UUID, UUIDV4 } = DataTypes;

import sequelize from "./database";
import User from "./user";

class Auth extends Model {
  static async createAuth(user: any) {
    const newAuth = await Auth.create({
      userId: user.id,
      password: user.password,
      accessToken: null,
      refreshToken: null,
    });
    return newAuth;
  }
  static async getUserInfo(userID: string) {
    const user = await Auth.findByPk(userID);
    if (!user) return false;
    return user;
  }

  static async updateUserAccessToken(userId: string, accessToken: string) {
    const auth = await this.getUserInfo(userId);
    if (auth) {
      await auth.update({ accessToken });
      await auth.save();
      return true;
    }
    return { error: "Please login again" };
  }
}
Auth.init(
  {
    userId: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
    },
    password: {
      type: STRING,
      allowNull: false,
      unique: true,
    },
    accessToken: {
      type: STRING,
      allowNull: true,
    },
    refreshToken: {
      type: STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Auth",
    tableName: "Auths",
    timestamps: false,
  }
);
(async () => await Auth.sync({ alter: true }))();

// (async () => await Auth.drop())();

export default Auth;
