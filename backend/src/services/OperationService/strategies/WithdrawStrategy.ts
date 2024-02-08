import { Account } from "../../../models/Account";
import { Transaction } from "../../../models/Transaction";
import { AccountRepository } from "../../../repositories/AccountRepository";
import { TransactionRepository } from "../../../repositories/TransactionRepository";
import { OperationDetails, OperationResponse, OperationStrategy } from "../OperationStrategy";

export class WithdrawStrategy implements OperationStrategy {
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
        account = account.withdraw(amount); // throw error if can't withdraw (considering overdraft)
        // Update from account 
        try {
            await accountRepository.update({ accountId: fromAccountId }, account.getData())
        } catch (e: any) {
            throw new Error("Error updating account. Error: " + e.message)
        }
        // Create new transaction 
        try {
            let performedTransactionData = Transaction.create('WITHDRAW', amount, fromAccountId).getData()
            await transactionRepository.create(performedTransactionData)
            return { account: account.getData(), transaction: performedTransactionData }
        } catch (e: any) {
            throw new Error("Error adding new transaction. Error: " + e.message)
        }
    }
}