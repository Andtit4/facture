export class Invoice {
    constructor(
        public id: number,
        public invoice_number: string,
        public status: string,
        public total_amount: number,
        public customer_id: number,
        public issue_date: Date,
        public due_date: Date,
    ) {}

}