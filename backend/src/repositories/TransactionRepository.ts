import { MongoDB } from "../connectors/db";
import { TransactionType } from "../models/Transaction";

const NAME: string = 'transactions';
export class TransactionRepository {
    static async list(dbquery: any, showDeleted:boolean = false): Promise<TransactionType[]>{
        const db = await MongoDB.connect();
        const result = await db.list(NAME, dbquery, showDeleted)
        await db.close() 
        return result
    }
    static async read(dbquery: any, showDeleted:boolean = false): Promise<TransactionType>{
        const db = await MongoDB.connect();
        const result = await db.read(NAME, dbquery, showDeleted)
        await db.close() 
        return result
    }
    static async update(dbquery: any, transactionData: TransactionType): Promise<TransactionType>{
        const db = await MongoDB.connect();
        const result = await db.update(NAME, dbquery, transactionData)
        await db.close() 
        return result
    }
    static async create(transactionData: TransactionType): Promise<TransactionType>{
        const db = await MongoDB.connect();
        const result = await db.create(NAME, transactionData)
        await db.close() 
        return result
    }
    static async delete(dbquery: any): Promise<TransactionType>{
        const db = await MongoDB.connect();
        const result = await db.delete(NAME, dbquery)
        await db.close() 
        return result
    }
  }