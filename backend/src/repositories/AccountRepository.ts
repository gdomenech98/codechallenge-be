import { MongoDB } from "../connectors/db";
import { AccountType } from "../models/Account";

const NAME: string = 'accounts';
export class AccountRepository {
    private db; // for example MongoDB instance
    constructor(db: any) {
        this.db = db
    }

    async list(dbquery: any, showDeleted: boolean = false): Promise<AccountType[]> {
        return await this.db.list(NAME, dbquery, showDeleted)
    }
    async read(dbquery: any, showDeleted: boolean = false): Promise<AccountType> {
        return await this.db.read(NAME, dbquery, showDeleted)
    }
    async update(dbquery: any, accountData: AccountType): Promise<AccountType> {
        return await this.db.update(NAME, dbquery, accountData)
    }
    async create(accountData: AccountType): Promise<AccountType> {
        return await this.db.create(NAME, accountData)
    }
    async delete(dbquery: any): Promise<AccountType> {
        return await this.db.delete(NAME, dbquery)
    }
}