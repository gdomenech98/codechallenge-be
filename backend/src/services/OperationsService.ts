import { Account, AccountType } from "../models/Account";
import { TransactionCollection, TransactionType, Transaction } from "../models/Transaction";
import { AccountRepository } from "../repositories/AccountRepository";
import { TransactionRepository } from "../repositories/TransactionRepository";

export class OperationsService {
  constructor() { }

  static async createOperation(operation: TransactionType['operation'], amount: number, fromAccountId: string, toAccoundId?: string): Promise<{ transaction: TransactionType, account: AccountType } | undefined> {
    // find account where operation is performed
    const accountData = await AccountRepository.read({ accountId: fromAccountId }); // If not found throw an exception
    if (!accountData) throw "Can't perform operation, account doesn't exist" // This if is for healthchecking
    let account = Account.load(accountData);
    const accountID = account.getId();
    
    switch (operation) {
      case 'DEPOSIT':
        // find last 'DEPOSIT' transactions of the last 24h
        const ts_24h_ago = new Date().getTime() - (24 * 60 * 60 * 1000);
        const dailyTransactionsQuery = {
          fromAccountId: accountID,
          operation,
          timestamp: {
            $gt: ts_24h_ago
          }
        }

        let dayAccountDeposits: number;
        try {
          const transactionData = await TransactionRepository.list(dailyTransactionsQuery);
          dayAccountDeposits = TransactionCollection.load(transactionData).totalAmount();
        } catch (error) {
          dayAccountDeposits = 0
          if (error !== 'Not found') {
            throw "Something wrong happened when trying to fetch transaction list."
          }
        }
        // Update account
        account = account.deposit(amount, dayAccountDeposits)
        try {
          await AccountRepository.update({ accountId: fromAccountId }, account.getData())
        } catch (e) {
          throw "Error updating account. Error: " + e
        }
        // Create new transaction 
        try {
          const performedTransactionData = Transaction.create(operation, amount, accountID).getData()
          await TransactionRepository.create(performedTransactionData)
          return { account: account.getData(), transaction: performedTransactionData }
        } catch (e) {
          throw "Error adding new transaction. Error: " + e
        }

      case 'WITHDRAW':
        account = account.withdraw(amount); // throw error if can't withdraw (considering overdraft)
        try {
          await AccountRepository.update({ accountId: fromAccountId }, account.getData())
        } catch (e) {
          throw "Error updating account. Error: " + e
        }
        // Create new transaction 
        try {
          const performedTransactionData = Transaction.create(operation, amount, accountID).getData()
          await TransactionRepository.create(performedTransactionData)
          return { account: account.getData(), transaction: performedTransactionData }
        } catch (e) {
          throw "Error adding new transaction. Error: " + e
        }
    }
  }
}
