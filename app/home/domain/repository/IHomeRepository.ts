import User from "@/app/login/domain/entities/User";

export interface IHomeRepository {
    getCurrentUser(): Promise<User>;
}