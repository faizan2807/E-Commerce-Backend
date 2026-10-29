import { IUser, Ilogin, IchangePassword } from "../interfaces/IUser";
import User from "../models/User";
import bcrypt from 'bcrypt';

class UserRepository {

  async login(userData: Ilogin) {
    const { email, password } = userData;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid email");
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid password");
    }
    return user;
  }


  async createUser(userData: Partial<IUser>) {
    return await User.create(userData);
  }

  async getAllUsers() {
    return await User.find();
  }

  async getUserById(id: string) {
    return await User.findById(id);
  }

  async updateUser(id: string, userData: Partial<IUser>) {
    return await User.findByIdAndUpdate(id, userData, { returnDocument: "after" });
  }

  async deleteUser(id: string) {
    return await User.findByIdAndDelete(id);
  }

  async verifyEmail(email: string) {
    const verify = await User.findOne({ email });
    if (!email) {
      throw new Error("Enter Email")
    }
    return verify
  };

  async updateTokens(
    userId: string,
    token: string,
    refreshToken: string
  ) {
    return await User.findByIdAndUpdate(
      userId,
      {
        token: token,
        refreshToken: refreshToken,
      },
      { returnDocument: "after" }
    );
  }

  async changePassword(email: string, password: string): Promise<IUser | null> {
    const hashPassword = await bcrypt.hash(password, 10);
    return await User.findOneAndUpdate({ email }, { password: hashPassword }, { returnDocument: "after", runValidators: true });
  }

  async fogotpassword(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async addAddress(id: string, address: IUser["address"]) {
    return await User.findByIdAndUpdate( id, { $set: { address,}, }, { returnDocument: "after", runValidators: true, });
  }
}
export default new UserRepository();