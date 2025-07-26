import { api } from "@/app/services/api";
import { IHomeRepository } from "../domain/repository/IHomeRepository";
import User from "@/app/login/domain/entities/User";
import { Customer } from "../domain/model/Customers";

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
    static async createCustomer(customer: Customer): Promise<Customer> {
        try {
            const response = await api.post('/customers/create', customer);
            return response.data as Customer;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }
    static async getCustomers(): Promise<Customer[]> {
        try {
            const response = await api.get('/customers');
            return response.data as Customer[];
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    }
 

}