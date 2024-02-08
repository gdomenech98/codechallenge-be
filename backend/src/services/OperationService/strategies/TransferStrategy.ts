import { Account, AccountType } from "../../../models/Account";
import { Transaction } from "../../../models/Transaction";
import { AccountRepository } from "../../../repositories/AccountRepository";
import { TransactionRepository } from "../../../repositories/TransactionRepository";
import { OperationDetails, OperationResponse, OperationStrategy } from "../OperationStrategy";

export class TransferStrategy implements OperationStrategy {
    db: any;
    constructor(db: any) {
        this.db = db;
    }
    async execute({ fromAccountId, toAccountId, amount }: OperationDetails): Promise<OperationResponse> {
        const accountRepository = new AccountRepository(this.db)
        const transactionRepository = new TransactionRepository(this.db)
        const accountData = await accountRepository.read({ accountId: fromAccountId }); 
        let destinataryAccountData: AccountType;
        let account = new Account(accountData);
        let destinataryAccount: Account | undefined;
        if (!fromAccountId) throw new Error("Error: can't perform transfer, destinatary is not specified")
        try {
            destinataryAccountData = await accountRepository.read({ accountId: toAccountId })
        } catch (e) {
            throw new Error("Error: can't perform transfer, desinatary account doesn't exist.")
        }
        // Once healthchecked the destinatary perform transfer
        destinataryAccount = new Account(destinataryAccountData);
        account = account.transfer(amount); // it throws error if overdraft
        destinataryAccount = destinataryAccount.recieveTransfer(amount);
        // update destinatary account 
        await accountRepository.update({ accountId: toAccountId }, destinataryAccount.getData())
        // update from account 
        await accountRepository.update({ accountId: fromAccountId }, account.getData())
        // Create new transaction 
        let performedTransactionData = Transaction.create('TRANSFER', amount, fromAccountId, toAccountId).getData()
        await transactionRepository.create(performedTransactionData)
        return {
            account: account.getData(),
            transaction: performedTransactionData,
            destinataryAccount: (destinataryAccount as Account).getData()
        }
    }
}