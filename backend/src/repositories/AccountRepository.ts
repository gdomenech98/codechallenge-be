import { MongoDB } from "../connectors/db";
import { AccountType } from "../models/Account";

const NAME: string = 'accounts';
export class AccountRepository {
    private static async connect() {
        const db = await MongoDB.connect();
        if (!db) throw 'Could not connect to database'
        return db;
    }

    static async list(dbquery: any, showDeleted: boolean = false): Promise<AccountType[]> {
        const db = await AccountRepository.connect();
        const result = await db.list(NAME, dbquery, showDeleted)
        await db.close()
        return result
    }
    static async read(dbquery: any, showDeleted: boolean = false): Promise<AccountType> {
        const db = await AccountRepository.connect();
        const result = await db.read(NAME, dbquery, showDeleted)
        await db.close()
        return result
    }
    static async update(dbquery: any, accountData: AccountType): Promise<AccountType> {
        const db = await AccountRepository.connect();
        const result = await db.update(NAME, dbquery, accountData)
        await db.close()
        return result
    }
    static async create(accountData: AccountType): Promise<AccountType> {
        const db = await AccountRepository.connect();
        const result = await db.create(NAME, accountData)
        await db.close()
        return result
    }
    static async delete(dbquery: any): Promise<AccountType> {
        const db = await AccountRepository.connect();
        const result = await db.delete(NAME, dbquery)
        await db.close()
        return result
    }
}