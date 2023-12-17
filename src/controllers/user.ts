import { Request, Response } from "express";
import Auth from "../models/auth";
import User from "../models/user";
import { validatePartialUser, validateUser } from "../schemas/user";

class UserController {
  static async createUser(req: Request, res: Response) {
    const { username, fullname, password, email, nationality } = req.body;
    let { birthdate } = req.body;
    birthdate = new Date(birthdate);

    try {
      const validatedData = validateUser({
        username,
        fullname,
        password,
        email,
        birthdate,
        nationality,
      });

      if (!validatedData.success)
        return res.status(400).json(validatedData.error);

      const response = await User.createUser(validatedData.data);
      return res.status(201).json(response);
    } catch (error) {
      return res.status(500).json({ error: "Error creating user" });
    }
  }

  static async getUserInfo(req: Request, res: Response) {
    const { email } = req.body;
    try {
      const user = await User.getUserInfo(email);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ error: "User not found" });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(404).json({ error: "Users not found" });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { username, fullname, password, email, nationality } = req.body;
      let dataToValidate = req.body;
      let { birthdate } = req.body;
      if (birthdate) {
        birthdate = new Date(birthdate);
        dataToValidate = {
          username,
          fullname,
          password,
          email,
          birthdate,
          nationality,
        };
      }

      const validatedData = validatePartialUser(dataToValidate);
      if (!validatedData.success)
        return res.status(400).json({ message: "Wrong credentials" });
      const result = await User.updateUser(validatedData.data);

      if (result == 400)
        return res.status(400).json({ message: "Error updating user" });
      return res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error updating user" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const validatedData = validatePartialUser(req.body);
      if (!validatedData.success)
        return res.status(400).json({ message: "Wrong credentials" });
      const { email, password } = validatedData.data as any;
      const user = await User.login({ email, password });
      if (user == 404)
        return res.status(500).json({ message: "Wrong credentials" });
      const { accessToken, refreshToken } = user;
      res
        .status(200)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
        })
        .send({
          message: "User logged in successfully",
          accessToken: accessToken,
        });
    } catch (error) {
      return res.status(500).json({ error: "Error in login process" });
    }
  }

  static async logout(req: Request, res: Response) {
    const validatedData = validatePartialUser(req.body);
    if (!validatedData.success)
      return res.status(400).json({ message: "Wrong credentials" });
    const { email } = validatedData.data as any;

    const userLogOut = await User.logout(email);

    if (userLogOut == 200)
      return res.status(200).json({ message: "Sucessful logout" });

    return res.status(500).json({ error: "Error at logout" });
  }

  static async deleteUser(req: Request, res: Response) {
    const validatedData = validatePartialUser(req.body);
    if (!validatedData.success)
      return res.status(400).json({ message: "Wrong credentials" });
    const { email } = validatedData.data as any;
    const result = await User.deleteUser(email);
    if (result == 400)
      return res.status(500).json({ error: "Error deleting user" });
    return res
      .status(200)
      .json({ message: "User successfully deleted", id: result });
  }
}

export default UserController;
