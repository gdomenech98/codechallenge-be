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
        const accountData = await accountRepository.read({ accountId: fromAccountId }); // If not found throw an exception
        if (!accountData) throw new Error("Can't perform operation, account doesn't exist") // This if is for healthchecking
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
            const transactionData = await transactionRepository.list(dailyTransactionsQuery);
            dayAccountDeposits = new TransactionCollection(transactionData).totalAmount();
        } catch (error: any) {
            if (error.message !== 'Not found') {
                throw new Error("Something wrong happened when trying to fetch transaction list.")
            }
        }
        account = account.deposit(amount, dayAccountDeposits)
        // Update from account 
        try {
            await accountRepository.update({ accountId: fromAccountId }, account.getData())
        } catch (e: any) {
            throw new Error("Error updating account. Error: " + e.message)
        }
        // Create new transaction 
        try {
            let transactionData = Transaction.create('DEPOSIT', amount, fromAccountId).getData()
            await transactionRepository.create(transactionData)
            return { account: account.getData(), transaction: transactionData }
        } catch (e: any) {
            throw new Error("Error adding new transaction. Error: " + e.message)
        }
    }
}
