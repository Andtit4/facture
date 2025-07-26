import User from "@/app/login/domain/entities/User";
import { Customer } from "../model/Customers";
import { Product } from "../model/Product";

export interface IHomeRepository {
    getCurrentUser(): Promise<User>;

    // Customer
    createCustomer(customer: Customer): Promise<Customer>;
    getCustomers(): Promise<Customer[]>;

    // Invoices
    getInvoices(): Promise<any[]>;

    // Products
    createProduct(product: Product): Promise<Product>;
    getProducts(): Promise<any[]>;
}