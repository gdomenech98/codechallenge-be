// export class TransactionService {


//     constructor(
//         private acountRepository: AccountRepository,
//         private transactionRepository: TransactionRepository
//     ) { }

//     async createTransaction(accountId: string, amount: number, type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'): Promise<Transaction> {
//         const account = await this.accountRepository.findById(accountId);
//         if (!account) {
//           throw new Error('Account does not exist');
//         }
    
//         // Aquí puedes incluir más lógica del dominio, como validar el saldo para retiros
    
//         const transaction = new Transaction(/* generar ID */, accountId, amount, type, new Date());
//         await this.transactionRepository.save(transaction);
    
//         return transaction;
//       }
// }
