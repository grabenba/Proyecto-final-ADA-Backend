import { Request, Response } from "express"
import Auth from "../models/auth"
import User from "../models/user"
import { validatePartialUser, validateUser } from "../schemas/user"

class UserController {
  static async createUser(req: Request, res: Response) {
    const { username, fullname, password, email, nationality } = req.body
    let { birthdate } = req.body
    birthdate = new Date(birthdate)

    try {
      const validatedData = validateUser({
        username,
        fullname,
        password,
        email,
        birthdate,
        nationality,
      })

      if (!validatedData.success)
        return res.status(400).json(validatedData.error)

      const response = await User.createUser(validatedData.data)
      return res.status(201).json(response)
    } catch (error) {
      return res.status(500).json({ error: "Error creating user" })
    }
  }

  static async getUserInfo(req: Request, res: Response) {
    const userId = req.params.id
    try {
      const user = await User.getUserInfo(userId)
      res.status(200).json(user)
    } catch (error) {
      res.status(404).json({ error: "User not found" })
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const users = await User.findAll()
      res.status(200).json(users)
    } catch (error) {
      res.status(404).json({ error: "Users not found" })
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const userData = req.body
      const result = await User.updateUser(userData)

      return res.status(200).json(result)
    } catch (error) {
      return res.status(500).json({ error: "Error updating user" })
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const validatedData = validatePartialUser(req.body)

      if (!validatedData.success)
        return res.status(400).json(validatedData.error)

      const { email, password } = validatedData.data as any
      const user = await User.login({ email, password })
      return res.json(user)
    } catch (error) {
      return res.status(500).json({ error: "Error en el proceso de login" })
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { id } = req.body

      await Auth.update({ refreshToken: null }, { where: { id } })
      return res.status(200).json({ message: "Logout exitoso" })
    } catch (error) {
      return res.status(500).json({ error: "Error al realizar el logout" })
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.body
      await User.deleteUser(userId)
      return res
        .status(200)
        .json({ message: "User successfully deleted", id: userId })
    } catch (error) {
      return res.status(500).json({ error: "Error deleting user" })
    }
  }
}

export default UserController
