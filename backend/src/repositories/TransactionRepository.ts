import { MongoDB } from "../connectors/db";
import { TransactionType } from "../models/Transaction";

const NAME: string = 'transactions';
export class TransactionRepository {
    private readonly db;
    constructor(db: any) {
        this.db = db
    }

    static async create() {
        const db = await MongoDB.connect();
        if (!db) throw new Error('Could not connect to database')
        return new TransactionRepository(db);
    }
    async list(dbquery: any, showDeleted: boolean = false): Promise<TransactionType[]> {
        const result = await this.db.list(NAME, dbquery, showDeleted)
        return result
    }
    async read(dbquery: any, showDeleted: boolean = false): Promise<TransactionType> {
        const result = await this.db.read(NAME, dbquery, showDeleted)
        return result
    }
    async update(dbquery: any, transactionData: TransactionType): Promise<TransactionType> {
        const result = await this.db.update(NAME, dbquery, transactionData)
        return result
    }
    async create(transactionData: TransactionType): Promise<TransactionType> {
        const result = await this.db.create(NAME, transactionData)
        return result
    }
    async delete(dbquery: any): Promise<TransactionType> {
        const result = await this.db.delete(NAME, dbquery)
        return result
    }
    async close(): Promise<void> {
        await this.db.close()
    }
}