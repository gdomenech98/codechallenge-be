import { Account } from "../../../models/Account";
import { TransactionCollection, Transaction } from "../../../models/Transaction";
import { AccountRepository } from "../../../repositories/AccountRepository";
import { TransactionRepository } from "../../../repositories/TransactionRepository";
import { OperationDetails, OperationResponse, OperationStrategy } from "../OperationStrategy";

export class DepositStrategy implements OperationStrategy {
    db: any;
    constructor(db: any) {
        this.db = db;
    }

    async execute({ fromAccountId, amount }: OperationDetails): Promise<OperationResponse> {
        const accountRepository = new AccountRepository(this.db)
        const transactionRepository = new TransactionRepository(this.db)
        const accountData = await accountRepository.read({ accountId: fromAccountId });
        let account = new Account(accountData);
        // find last 'DEPOSIT' transactions of the last 24h
        const ts_24h_ago = new Date().getTime() - (24 * 60 * 60 * 1000);
        const dailyTransactionsQuery = {
            accountId: fromAccountId,
            operation: 'DEPOSIT',
            timestamp: {
                $gt: ts_24h_ago
            }
        }

        let dayAccountDeposits: number = 0;
        try {
            const transactionsDataList = await transactionRepository.list(dailyTransactionsQuery);
            dayAccountDeposits = new TransactionCollection(transactionsDataList).totalAmount();
        } catch (e) {
            console.warn('No found deposits in the las 24h ')
        }

        account = account.deposit(amount, dayAccountDeposits)
        // Update from account 
        await accountRepository.update({ accountId: fromAccountId }, account.getData())
        // Create new transaction 
        let transactionData = Transaction.create('DEPOSIT', amount, fromAccountId).getData()
        await transactionRepository.create(transactionData)
        return { account: account.getData(), transaction: transactionData }
    }
}
