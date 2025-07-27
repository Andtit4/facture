export class InvoiceItem {
  constructor(
    public id: number,
    public invoice_id: number,
    public product_id: number,
    public quantity: number,
    public unit_price: number,
  ) {}
}
