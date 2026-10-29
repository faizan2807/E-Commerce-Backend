import userController from "../controllers/user.controller";
import { Ilogin, IUser } from "../interfaces/IUser";
import userRepository from "../repositories/user.repository";
import UserRepository from "../repositories/user.repository";
import bcrypt from "bcrypt";


class UserService {
  // login user
  async login(userData: Ilogin) {
    return await UserRepository.login(userData);
  }

  // Create User
  async createUser(userData: IUser) {
    return await UserRepository.createUser(userData);
  }

  // Get All Users
  async getAllUsers() {
    return await UserRepository.getAllUsers();
  }

  // Get User By Id
  async getUserById(id: string) {
    return await UserRepository.getUserById(id);
  }

  // Update User
  async updateUser(id: string, userData: Partial<IUser>) {
    return await UserRepository.updateUser(id, userData);
  }

  // Delete User
  async deleteUser(id: string) {
    return await UserRepository.deleteUser(id);
  }

  //refreshToken
  async updateTokens(
    userId: string,
    token: string,
    refreshToken: string
  ) {
    return await UserRepository.updateTokens(
      userId,
      token,
      refreshToken
    );
  }

  //verifyEmail
  async verifyEmail(email: string) {
    return await UserRepository.verifyEmail(email)
  }

  //forgot password
  async forgotPassword(email: string) {
    return await UserRepository.fogotpassword(email)
  }

  //change Password
  async changepassword(email: string, password: string) {
    return await UserRepository.changePassword(email, password);
  }
  
  //post address
  async addAddress(id: string, address: IUser["address"]) {
    const user = await userRepository.addAddress(id, address);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}

export default new UserService();