import { Account } from "../models/Account";
import { TransactionType } from "../models/Transaction";
import { AccountRepository, 
  // MAX_DEPOSIT_PER_DAY 
} from "../repositories/AccountRepository";
import { TransactionRepository } from "../repositories/TransactionRepository";

export class OperationsService {
  constructor(
  ) { }

  static async createOperation(operation: TransactionType['operation'], amount: number, fromAccountId: string, toAccoundId?: string): Promise<any> {
    switch (operation) {
      case 'DEPOSIT': 
        // find account where operation is performed
        const accountData = await AccountRepository.read({accountId: fromAccountId}); // If not found throw an exception
        if(!accountData) throw "Can't perform deposit, account doesn't exist" // This if is for healthchecking
        let account = Account.load(accountData);
        // find last 'DEPOSIT' transactions of the last 24h
        const ts_24h_ago = new Date().getTime() - (24 * 60 * 60 * 1000);
        const dailyTransactionsQuery = {
          fromAccountId: account.getId(),
          operation,
          timestamp: {
            $gt: ts_24h_ago
          }
        }
        const dayAccountDeposits = await TransactionRepository.list(dailyTransactionsQuery);
        // Compute day account diposits
        console.log('dayAccountDeposits', dayAccountDeposits)
        break;
      // Compute total amount
    }
  }
}
