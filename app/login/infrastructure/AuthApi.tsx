import axios from "axios";
import { User } from "../domain/entities/User";
import { ILoginRepository } from "../domain/repositories/ILoginRepository";
import { api } from "@/app/services/api";

export  class AuthApi implements ILoginRepository {
    static async login(email: string, password: string): Promise<User> {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response.data as User;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /* static async Login(email: string, password: string): Promise<User> {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response.data as User;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    } */
}