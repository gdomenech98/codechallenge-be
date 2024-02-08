import { v4 as uuidv4 } from 'uuid';


export interface AccountType {
    accountId: string;
    ownerId: string;
    balance: number;
    // Could add account creation timestamp, but ommited
}

export class Account {
    private readonly data: AccountType;
    private readonly MAX_OVERDRAFT: number = -200;
    private readonly MAX_DEPOSIT_PER_DAY: number = 5000;

    constructor(data: AccountType) {
        this.validate(data)
        this.data = data;
    }

    private validate(data: AccountType): void {
        if (!data.accountId) throw new Error("Account should have an accountId")
        if (!data.ownerId) throw new Error("Account should have an ownerId")
    }

    getData(): AccountType {
        return this.data;
    }

    get<T extends keyof AccountType>(key: T): AccountType[T] {
        return this.getData()[key]
    }

    getId(): string {
        return this.get("accountId")
    }

    getBalance(): number {
        return this.get('balance')
    }

    getOwner(): string {
        return this.get('ownerId')
    }

    set<T extends keyof AccountType>(key: T, value: AccountType[T]): Account {
        const prevData = this.getData()
        return new Account({ ...prevData, [key]: value })
    }

    static create(ownerId: string, accountId?: string): Account { // FACTORY
        const newAccountData: AccountType = {
            accountId: accountId ?? uuidv4(),
            ownerId,
            balance: 0 // assuming that when created the balance is 0
        }
        return new Account(newAccountData)
    }

    withdraw(amount: number): Account {
        if (amount <= 0) throw new Error('Error: withdrawal must specify an amount')
        const updatedBalance: number = this.getBalance() - amount
        // Widthdraw validation
        const isValid: boolean = updatedBalance > this.MAX_OVERDRAFT;
        if (!isValid) throw new Error(`Could not withdraw ammount ${amount} from the account, maximum overdraft (${this.MAX_OVERDRAFT}) exceeded`)
        return this.set('balance', updatedBalance)
    }

    deposit(amount: number, dailyDepositedAmount: number): Account {
        if (amount <= 0) throw new Error('Depostits must specify an amount')
        if (amount + dailyDepositedAmount > this.MAX_DEPOSIT_PER_DAY) throw new Error(`Could not diposito amount ${amount}, maximum deposit per day (${this.MAX_DEPOSIT_PER_DAY}$/24h) exceeded`)
        const updatedBalance: number = this.getBalance() + amount;
        return this.set('balance', updatedBalance)
    }

    transfer(amount: number): Account {
        if (amount <= 0) throw new Error('Transfers must specify an amount')
        if (this.getBalance() - amount < 0) throw new Error('Can not overdraw in transfer')
        const updatedBalance: number = this.getBalance() - amount;
        return this.set('balance', updatedBalance)
    }

    recieveTransfer(amount: number): Account {
        if (amount <= 0) throw new Error('Recieved transfers must specify an amount')
        const updatedBalance: number = this.getBalance() + amount;
        return this.set('balance', updatedBalance)
    }
}
