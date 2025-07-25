import {User} from "../entities/User";

export default interface ILoginRepository {
    login(email: string, password: string): Promise<User>;
}