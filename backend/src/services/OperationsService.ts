import { Account, AccountType } from "../models/Account";
import { TransactionCollection, TransactionType, Transaction } from "../models/Transaction";
import { AccountRepository } from "../repositories/AccountRepository";
import { TransactionRepository } from "../repositories/TransactionRepository";

export class OperationsService {
  constructor() { }

  static async createOperation(operation: TransactionType['operation'], amount: number, fromAccountId: string, toAccoundId?: string): Promise<{ transaction: TransactionType, account: AccountType } | undefined> {
    // find account where operation is performed
    const accountData = await AccountRepository.read({ accountId: fromAccountId }); // If not found throw an exception
    let destinataryAccountData: AccountType;
    if (!accountData) throw "Can't perform operation, account doesn't exist" // This if is for healthchecking
    let account = Account.load(accountData);
    let destinataryAccount: Account;

    switch (operation) {
      case 'DEPOSIT':
        // find last 'DEPOSIT' transactions of the last 24h
        const ts_24h_ago = new Date().getTime() - (24 * 60 * 60 * 1000);
        const dailyTransactionsQuery = {
          fromAccountId,
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
        account = account.deposit(amount, dayAccountDeposits)
        break;
      case 'WITHDRAW':
        account = account.withdraw(amount); // throw error if can't withdraw (considering overdraft)
        break
      case 'TRANSFER': // TOTEST
        if (!toAccoundId) throw "Error: can't perform transfer, destinatary is not specified"
        try {
          destinataryAccountData = await AccountRepository.read({ accountId: toAccoundId })
        } catch (e) {
          throw "Error: can't perform transfer, desinatary account doesn't exist."
        }
        // Once healthchecked the destinatary perform transfer
        destinataryAccount = Account.load(destinataryAccountData);
        account = account.transfer(amount); // it throws error if overdraft
        destinataryAccount = destinataryAccount.recieveTransfer(amount);
        // update destinatary account 
        try {
          await AccountRepository.update({ accountId: toAccoundId }, destinataryAccount.getData())
        } catch (e) {
          throw "Error updating account. Error: " + e
        }
        break
    }

    // Update from account 
    try {
      await AccountRepository.update({ accountId: fromAccountId }, account.getData())
    } catch (e) {
      throw "Error updating account. Error: " + e
    }

    // Create new transaction 
    try {
      let performedTransactionData;
      if(operation === 'TRANSFER') {
        performedTransactionData = Transaction.create(operation, amount, fromAccountId, toAccoundId).getData()
      }else {
        performedTransactionData = Transaction.create(operation, amount, fromAccountId).getData()
      }
      await TransactionRepository.create(performedTransactionData)
      return { account: account.getData(), transaction: performedTransactionData }
    } catch (e) {
      throw "Error adding new transaction. Error: " + e
    }
  }
}
