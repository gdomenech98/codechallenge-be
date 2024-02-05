
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

    static load(data: TransactionType): Transaction {
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
        }catch(e) {
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
        id?: string
        ): Transaction {
        let newTransactionData: TransactionType = {
            id: id??uuidv4(),
            operation: operation,
            amount,
            fromAccountId,
            timestamp:  Date.now()
        }
        if(operation === "TRANSFER") {
            if(!toAccountId) throw `The destinatary should be specified when performing transaction of type "${operation}"`
            newTransactionData = {...newTransactionData, toAccountId}
        }
        return Transaction.load(newTransactionData)
    }
}


export class TransactionCollection { // WIP
    private readonly items: Transaction[];
    constructor(items: Transaction[]) {
        this.items = items;
    }
    static load(items: Transaction[]): TransactionCollection {
        return new TransactionCollection(items)
    }

    getItems(): Transaction[] {
        return this.items;
    }

    length(): number {
        return this.getItems().length;
    }

    // getDailyTransactions(): TransactionCollection{
    //     return 
    // }
}