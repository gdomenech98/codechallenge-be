
import { v4 as uuidv4 } from 'uuid';

export interface TransactionType {
    id: string,
    operation: "WITHDRAW" | "TRANSFER" | "DEPOSIT",
    amount: number,
    timestamp: number,
    fromAccountId: string,
    toAccountId?: string // optional, necessary data only for "TRANSFER"
}

export class Transaction {
    private readonly data: TransactionType;

    constructor(data: TransactionType) {
        this.data = data;
    }

    static validate(data: TransactionType): boolean {
        if (data.amount === undefined) throw "Transaction should have an amount"
        if (data.amount <= 0) throw "Transaction should have a possitive amount"
        if (data.fromAccountId === undefined) throw "Transaction should have an fromAccountId"
        if (data.operation === undefined) throw "Transaction must specify an operation"
        if (!["WITHDRAW", "TRANSFER", "DEPOSIT"].includes(data.operation)) throw "Invalid operation for transaction"
        if (data.operation === "TRANSFER" && data.toAccountId === undefined) throw "Transaction of type TRANSFER must specify a destination account"
        return true
    }

    static load(data: TransactionType): Transaction {
        if(!Transaction.validate(data)) throw "No valid data for Transaction"
        return new Transaction(data)
    }

    getData(): TransactionType {
        return this.data;
    }

    get(key: keyof TransactionType): any {
        return this.getData()[key]
    }

    getId(): string {
        return this.get("id")
    }

    getAmount(): number {
        return this.get("amount")
    }

    getFromAccount(): number {
        return this.get("fromAccountId")
    }

    getToAccount(): number {
        try {
            return this.get("toAccountId")
        } catch (e) {
            throw "This transaction has no desinary identifier (toAccountId)"
        }
    }

    getOperationType(): keyof TransactionType["operation"] {
        return this.get('operation')
    }

    getTimestamp(): number {
        return this.get('timestamp')
    }

    static create(
        operation: TransactionType["operation"],
        amount: number,
        fromAccountId: string,
        toAccountId?: string,
        id?: string,
        timestamp?: number
    ): Transaction {
        let newTransactionData: TransactionType = {
            id: id ?? uuidv4(),
            operation: operation,
            amount,
            fromAccountId,
            timestamp: timestamp ?? Date.now()
        }
        if (operation === "TRANSFER") {
            if (!toAccountId) throw `The destinatary should be specified when performing transaction of type "${operation}"`
            newTransactionData = { ...newTransactionData, toAccountId }
        }
        return Transaction.load(newTransactionData)
    }
}


export class TransactionCollection { // WIP
    private readonly items: Transaction[];
    constructor(items: Transaction[]) {
        this.items = items;
    }

    static load(data: TransactionType[]): TransactionCollection {
        const items = data.map((item: TransactionType) => Transaction.load(item))
        return new TransactionCollection(items)
    }

    getItems(): Transaction[] {
        return this.items;
    }

    length(): number {
        return this.getItems().length;
    }

    totalAmount(): number {
        return this.getItems().reduce((total: number, item: Transaction) => {
            const newTotal = total + item.getAmount()
            return newTotal
        }, 0)
    }
}