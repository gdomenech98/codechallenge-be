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
        const accountData = await accountRepository.read({ accountId: fromAccountId }); 
        let account = new Account(accountData);
        account = account.withdraw(amount); // throw error if can't withdraw (considering overdraft)
        await accountRepository.update({ accountId: fromAccountId }, account.getData())
        // Create new transaction 
        let performedTransactionData = Transaction.create('WITHDRAW', amount, fromAccountId).getData()
        await transactionRepository.create(performedTransactionData)
        return { account: account.getData(), transaction: performedTransactionData }
    }
}