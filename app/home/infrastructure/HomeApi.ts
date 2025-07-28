import { api } from "@/app/services/api";
import { IHomeRepository } from "../domain/repository/IHomeRepository";
import User from "@/app/login/domain/entities/User";
import { Customer } from "../domain/model/Customers";
import { Product } from "../domain/model/Product";
import { Invoice } from "../domain/model/Invoice";

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

    static async getInvoices(): Promise<any[]> {
        try {
            const response = await api.get('/invoices');
            return response.data as any[];
        } catch (error) {
            console.error('Error fetching invoices:', error);
            throw error;
        }
    }

    static async getProducts(): Promise<any[]> {
        try {
            const response = await api.get('/products');
            return response.data as any[];
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    static async createProduct(product: Product): Promise<Product> {
        try {
            const response = await api.post('/products', product);
            return response.data as Product;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    /* public id: number,
      public invoice_number: string,
      public status: string,
      public total_amount: number,
      public customer_id: number,
      public issue_date: Date,
      public due_date: Date, */

    /*    public id: number,
   public invoice_id: number,
   public product_id: number,
   public quantity: number,
   public unit_price: number, */

    static async createInvoice(invoice: Invoice): Promise<Invoice> {
        try {
            const response = await api.post('/invoices', invoice);
            return response.data as Invoice;
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    }

    static async createInvoiceItem(invoiceItem: any): Promise<any> {
        try {
            const response = await api.post('/invoice-items', invoiceItem);
            return response.data as any;
        } catch (error) {
            console.error('Error creating invoice item:', error);
            throw error;
        }
    }

    static async getTotalAmount() {
        try {
            const response = await api.get('/invoices/total-amount');
            return response.data as number;
        } catch (error) {
            console.error('Error fetching total amount:', error);
            throw error;
        }
    }

    static async getNumberOfCustomers(): Promise<number> {
        try {
            const response = await api.get('/customers/number-customers');
            return response.data as number;
        } catch (error) {
            console.error('Error fetching number of customers:', error);
            throw error;
        }
    }

    static async getNumberOfInvoices(): Promise<number> {
        try {
            const response = await api.get('/invoices/number-invoices');
            return response.data as number;
        } catch (error) {
            console.error('Error fetching number of invoices:', error);
            throw error;
        }
    }

    static async getNumberStatusOfInvoice(status: string): Promise<number> {
        try {
            const response = await api.get(`/invoices/number-status/${status}`);
            return response.data as number;
        } catch (error) {
            console.error(`Error fetching number of invoices with status ${status}:`, error);
            throw error;
        }
    }
}
