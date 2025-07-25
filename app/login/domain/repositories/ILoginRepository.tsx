import {User} from "../entities/User";

export default interface ILoginRepository {
    login(email: string, password: string): Promise<User>;
    register(email: string, username: string, password: string): Promise<User>;
}