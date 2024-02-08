import { MongoDB } from "../connectors/db";
import { AccountType } from "../models/Account";

const NAME: string = 'accounts';
export class AccountRepository {
    private readonly db;
    constructor(db: any) {
        this.db = db
    }

    static async create() {
        const db = await MongoDB.connect();
        if (!db) throw new Error('Could not connect to database')
        return new AccountRepository(db);
    }

    async list(dbquery: any, showDeleted: boolean = false): Promise<AccountType[]> {
        const result = await this.db.list(NAME, dbquery, showDeleted)
        return result
    }
    async read(dbquery: any, showDeleted: boolean = false): Promise<AccountType> {
        const result = await this.db.read(NAME, dbquery, showDeleted)
        return result
    }
    async update(dbquery: any, accountData: AccountType): Promise<AccountType> {
        const result = await this.db.update(NAME, dbquery, accountData)
        return result
    }
    async create(accountData: AccountType): Promise<AccountType> {
        const result = await this.db.create(NAME, accountData)
        return result
    }
    async delete(dbquery: any): Promise<AccountType> {
        const result = await this.db.delete(NAME, dbquery)
        return result
    }
    async close(): Promise<void> {
        await this.db.close()
    }
}