import { v4 as uuidv4 } from 'uuid';

export const MAX_DEPOSIT_PER_DAY: number = 5000;

export interface AccountType {
    accountId: string,
    ownerId: string,
    balance: number
    // Could add account creation timestamp, but ommited
}

export class Account {
    private readonly data: AccountType;
    private readonly MAX_OVERDRAFT: number = -200;

    constructor(data: AccountType) {
        this.data = data;
    }

    static load(data: AccountType): Account {
        return new Account(data)
    }

    getData(): AccountType {
        return this.data;
    }

    get(key: keyof AccountType): any {
        return this.getData()[key]
    }

    getId(): any {
        return this.get("accountId")
    }

    getBalance(): number {
        return this.get('balance')
    }

    getOwner(): string {
        return this.get('ownerId')
    }

    set(key: keyof AccountType, value: any): Account {
        const prevData = this.getData()
        return Account.load({...prevData, [key]: value})
    }

    static create(ownerId: string, accountId?: string): Account {
        const newAccountData: AccountType = {
            accountId: accountId??uuidv4(),
            ownerId,
            balance: 0 // assuming that when created the balance is 0
        }
        return Account.load(newAccountData)
    }

    withdraw(amount: number): Account {
        const updatedBalance: number = this.getBalance() - amount
        // Widthdraw validation
        const isValid: boolean = updatedBalance > this.MAX_OVERDRAFT;
        if(!isValid) throw `Could not withdraw ammount ${amount} from the account, maximum overdraft (${this.MAX_OVERDRAFT}) exceeded`
        return this.set('balance', updatedBalance)
    }

    deposit(amount: number): Account { // TOTEST
        const updatedBalance: number = this.getBalance() + amount;
        return this.set('balance', updatedBalance)
    }
}
