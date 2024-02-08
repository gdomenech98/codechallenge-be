import { DepositStrategy } from "./strategies/DepositStrategy";
import { WithdrawStrategy } from "./strategies/WithdrawStrategy";
import { TransferStrategy } from "./strategies/TransferStrategy";
import { MongoDB } from "../../connectors/db";
import { AccountType } from "../../models/Account";
import { OperationType, TransactionType } from "../../models/Transaction";

export type OperationDetails = {
    amount: number;
    fromAccountId: string;
    operation: OperationType
    toAccountId?: string;
}

export type OperationResponse = {
    account:  AccountType;
    transaction: TransactionType;
    destinataryAccount?: AccountType;
}

export interface OperationStrategy {
    execute(details: OperationDetails): Promise<OperationResponse>;
}

export class OperationsService {
    private strategies: Map<string, OperationStrategy>;
    private db: any;

    constructor() {
        this.strategies = new Map();
    }

    async init() {
        this.db = await MongoDB.connect(); 
        this.strategies.set('DEPOSIT', new DepositStrategy(this.db));
        this.strategies.set('WITHDRAW', new WithdrawStrategy(this.db));
        this.strategies.set('TRANSFER', new TransferStrategy(this.db));
    }

    async createOperation(details: OperationDetails): Promise<OperationResponse> {
        const strategy = this.strategies.get(details.operation);
        if (!strategy) {
            throw new Error(`Unknown operation ${details.operation}`);
        }
        return await strategy.execute(details);
    }
}