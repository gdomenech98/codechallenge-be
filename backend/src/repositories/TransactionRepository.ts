import { MongoDB } from "../connectors/db";
import { TransactionType } from "../models/Transaction";

const NAME: string = 'transactions';
export class TransactionRepository {
    private db: any; // for example MongoDB instance
    constructor(db: any) {
        this.db = db
    }

    async list(dbquery: any, showDeleted: boolean = false): Promise<TransactionType[]> {
        return await this.db.list(NAME, dbquery, showDeleted)
    }
    async read(dbquery: any, showDeleted: boolean = false): Promise<TransactionType> {
        return await this.db.read(NAME, dbquery, showDeleted)
    }
    async update(dbquery: any, transactionData: TransactionType): Promise<TransactionType> {
        return await this.db.update(NAME, dbquery, transactionData)
    }
    async create(transactionData: TransactionType): Promise<TransactionType> {
        return await this.db.create(NAME, transactionData)
    }
    async delete(dbquery: any): Promise<TransactionType> {
        return await this.db.delete(NAME, dbquery)
    }
}