import { AccountType } from "../models/Account";

const NAME: string = 'accounts';
export class AccountRepository {
    private db; // for example MongoDB instance
    constructor(db: any) {
        this.db = db
    }

    async list(dbquery: any, showDeleted: boolean = false): Promise<AccountType[]> {
        try {
            return await this.db.list(NAME, dbquery, showDeleted)

        } catch (error: any) {
            if (error.message !== 'Not found') {
                throw new Error("Something wrong happened when trying to fetch account list.")
            }
            throw error // bypass error if not handled
        }
    }
    async read(dbquery: any, showDeleted: boolean = false): Promise<AccountType> {
        try {
            return await this.db.read(NAME, dbquery, showDeleted)
        } catch (e) {
            throw new Error("Account doesn't exist")
        }
    }
    async update(dbquery: any, accountData: AccountType): Promise<AccountType> {
        try {
            return await this.db.update(NAME, dbquery, accountData)
        } catch (e: any) {
            throw new Error("Error updating account. Error: " + e.message)
        }
    }
    async create(accountData: AccountType): Promise<AccountType> {
        try {
            return await this.db.create(NAME, accountData)
        } catch (e: any) {
            throw new Error("Error adding new account. Error: " + e.message)
        }
    }
    async delete(dbquery: any): Promise<AccountType> {
        return await this.db.delete(NAME, dbquery)
    }
}