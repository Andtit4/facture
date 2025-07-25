import User from "../entities/User";

export default interface ILoginRepository {
    Login(email: string, password: string): Promise<User>;
}