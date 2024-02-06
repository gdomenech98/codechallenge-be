
import { v4 as uuidv4 } from 'uuid';

export type OperationType = "WITHDRAW" | "TRANSFER" | "DEPOSIT"
export interface TransactionType {
    id: string;
    operation: OperationType;
    amount: number;
    timestamp: number;
    fromAccountId: string;
    toAccountId?: string; // optional, necessary data only for "TRANSFER"
}

export class Transaction {
    private readonly data: TransactionType;

    constructor(data: TransactionType) {
        this.data = data;
    }

    static validate(data: TransactionType): void {
        if (!data.amount || data.amount <= 0) throw new Error("Transaction should have a possitive amount")
        if (data.fromAccountId === undefined) throw new Error("Transaction should have an fromAccountId")
        if (data.operation === undefined) throw new Error("Transaction must specify an operation")
        if (!["WITHDRAW", "TRANSFER", "DEPOSIT"].includes(data.operation)) throw new Error("Invalid operation for transaction")
        if (data.operation === "TRANSFER" && data.toAccountId === undefined) throw new Error("Transaction of type TRANSFER must specify a destination account")
        if (data.fromAccountId === data.toAccountId) throw new Error("Transaction couldn't have same source and destinatary account")
    }

    static load(data: TransactionType): Transaction {
        Transaction.validate(data)
        return new Transaction(data)
    }

    getData(): TransactionType {
        return this.data;
    }

    get<T extends keyof TransactionType>(key: T): TransactionType[T] {
        return this.getData()[key]
    }

    getId(): string {
        return this.get("id")
    }

    getAmount(): number {
        return this.get("amount")
    }

    getFromAccount(): string {
        return this.get("fromAccountId")
    }

    getToAccount(): string | undefined {
        return this.get("toAccountId")
    }

    getOperationType(): OperationType {
        return this.get('operation')
    }

    getTimestamp(): number {
        return this.get('timestamp')
    }

    set<T extends keyof TransactionType>(key: T, value: TransactionType[T]): Transaction {
        const prevData = this.getData()
        return Transaction.load({ ...prevData, [key]: value })
    }

    static create(
        operation: OperationType,
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
            toAccountId,
            timestamp: timestamp ?? Date.now()
        }
        if (!newTransactionData.toAccountId) {
            delete newTransactionData.toAccountId
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