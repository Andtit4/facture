import User from "@/app/login/domain/entities/User";
import { Customer } from "../model/Customers";

export interface IHomeRepository {
    getCurrentUser(): Promise<User>;

    // Customer
    createCustomer(customer: Customer): Promise<Customer>;
    getCustomers(): Promise<Customer[]>;

    // Invoices
    getInvoices(): Promise<any[]>;

    // Products
    getProducts(): Promise<any[]>;
}