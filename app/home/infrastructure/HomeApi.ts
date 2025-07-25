import { api } from "@/app/services/api";
import { IHomeRepository } from "../domain/repository/IHomeRepository";
import User from "@/app/login/domain/entities/User";

export class HomeApi implements IHomeRepository {
    static async getCurrentUser(): Promise<User> {
        try {
            const response = await api.get('/auth/me');
            return response.data as User;
        } catch (error) {
            console.error('Error fetching current user:', error);
            throw error;
        }
    }

}