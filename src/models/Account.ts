import { v4 as uuidv4 } from 'uuid';

export interface AccountType {
    accountId: string,
    ownerId: string,
    balance: Number
    // Could add account creation timestamp, but ommited
}
export class Account {
    private readonly data: AccountType;
    private readonly MAX_OVERDRAFT = 200;

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

    getBalance(): Number {
        return this.get('balance')
    }

    getOwner(): string {
        return this.get('ownerId')
    }

    static create(ownerId: string, accountId?: string): Account {
        const newAccountData: AccountType = {
            accountId: accountId??uuidv4(),
            ownerId,
            balance: 0 // assuming that when created the balance is 0
        }
        return Account.load(newAccountData)
    }

    // withdraw(amount: Number): Account {
        
    //     return 
    // }

    //Withdrawal supports a $200 overdraft (balance, can be down to -$200).
}
