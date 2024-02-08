import { TransactionType } from "../models/Transaction";

const NAME: string = 'transactions';
export class TransactionRepository {
    private db: any; // for example MongoDB instance
    constructor(db: any) {
        this.db = db
    }

    async list(dbquery: any, showDeleted: boolean = false): Promise<TransactionType[]> {
        try {
            return await this.db.list(NAME, dbquery, showDeleted)
        }
        catch (error: any) {
            if (error.message !== 'Not found') {
                throw new Error("Something wrong happened when trying to fetch transaction list.")
            }
            throw error // bypass error if not handled
        }
    }
    async read(dbquery: any, showDeleted: boolean = false): Promise<TransactionType> {
        try {
            return await this.db.read(NAME, dbquery, showDeleted)
        } catch (e) {
            throw new Error("Transaction doesn't exist")
        }
    }
    async update(dbquery: any, transactionData: TransactionType): Promise<TransactionType> {
        try {
            return await this.db.update(NAME, dbquery, transactionData)
        } catch (e: any) {
            throw new Error("Error updating transaction. Error: " + e.message)
        }
    }
    async create(transactionData: TransactionType): Promise<TransactionType> {
        try {
            return await this.db.create(NAME, transactionData)
        } catch (e: any) {
            throw new Error("Error adding new transaction. Error: " + e.message)
        }
    }
    async delete(dbquery: any): Promise<TransactionType> {
        return await this.db.delete(NAME, dbquery)
    }
}