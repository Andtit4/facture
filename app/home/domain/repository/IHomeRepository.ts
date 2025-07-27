import User from "@/app/login/domain/entities/User";
import { Customer } from "../model/Customers";
import { Product } from "../model/Product";
import { Invoice } from "../model/Invoice";

export interface IHomeRepository {
    getCurrentUser(): Promise<User>;

    // Customer
    createCustomer(customer: Customer): Promise<Customer>;
    getCustomers(): Promise<Customer[]>;

    // Invoices
    getInvoices(): Promise<any[]>;
    createInvoice(invoice: Invoice): Promise<Invoice>;

    // Invoice Items
    createIvoiceItem(invoiceItem: any): Promise<any>;

    // Products
    createProduct(product: Product): Promise<Product>;
    getProducts(): Promise<any[]>;
}