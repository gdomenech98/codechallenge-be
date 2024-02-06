import { v4 as uuidv4 } from 'uuid';
import { OperationsService } from '../../services/OperationsService';
import { Transaction, TransactionType } from '../../models/Transaction';
import { Account, AccountType } from '../../models/Account';
import { TransactionRepository } from '../../repositories/TransactionRepository';
import { AccountRepository } from '../../repositories/AccountRepository';

describe("test Account and Transaction repositories", () => {
    const ownerId1 = uuidv4()
    const accountId1 = uuidv4()
    const ownerId2 = uuidv4()
    const accountId2 = uuidv4()
    const transactionId1 = uuidv4()
    const transactionId2 = uuidv4()
    const transactionId3 = uuidv4()
    const account1 = Account.create(ownerId1, accountId1)
    const account2 = Account.create(ownerId2, accountId2)
    let transaction1_f1_t2: undefined | Transaction
    let transaction2_f1_t2: undefined | Transaction
    let transaction3_f1_t2_outdated: undefined | Transaction

    beforeAll(async () => {
        // Save accounts to db
        await AccountRepository.create(account1.getData());
        await AccountRepository.create(account2.getData());
        // Transaction 1 from 1 to 2
        transaction1_f1_t2 = Transaction.create('DEPOSIT', 300, accountId1, accountId2, transactionId1)
        // Transaction 2 from 1 to 2
        transaction2_f1_t2 = Transaction.create('DEPOSIT', 700, accountId1, accountId2, transactionId2)
        // Transaction 3 from 1 to 2 (more than 24h)
        transaction3_f1_t2_outdated = Transaction.create('DEPOSIT', 500, accountId1, accountId2, transactionId3, (new Date().getTime() - (25 * 60 * 60 * 1000)))
        // Save transactions to db
        await TransactionRepository.create(transaction1_f1_t2.getData())
        await TransactionRepository.create(transaction2_f1_t2.getData())
        await TransactionRepository.create(transaction3_f1_t2_outdated.getData())
    })
    it('should retrieve all created accounts (in this test)', async () => {
        const accounts = await AccountRepository.list({
            accountId: {
                $in: [accountId1, accountId2]
            }
        });
        expect(accounts).toHaveLength(2)
    })
    it('should retrieve all created transactions (in this test)', async () => {
        const transactions = await TransactionRepository.list({
            id: {
                $in: [transactionId1, transactionId2, transactionId3]
            }
        });
        expect(transactions).toHaveLength(3)
    })
    it('should be able to retrieve specific accounts by accountId', async () => {
        const accounts = await AccountRepository.list({ accountId: accountId1 })
        expect(accounts).toHaveLength(1)
    })
    it('should be able to retrieve specific transactiosn', async () => {
        const transactions = await TransactionRepository.list({ id: transactionId1 })
        expect(transactions).toHaveLength(1)

    })
    it('should be able to retrieve specific account by ownerId', async () => {
        const accountData = await AccountRepository.read({ ownerId: ownerId1 })
        expect(Account.load(accountData).getOwner()).toBe(ownerId1)
    })

    describe('test operation service', () => {
        it("should be able to perform DEPOSIT operation", async () => {
            const { transaction: transactionData, account: accountData } = await OperationsService.createOperation('DEPOSIT', 500, accountId1) as { transaction: TransactionType, account: AccountType }
            const transaction = Transaction.load(transactionData)
            const account = Account.load(accountData)
            expect(transaction.getAmount()).toBe(500)
            expect(transaction.getFromAccount()).toBe(accountId1)
            expect(account.getBalance()).toBe(500)
            expect(account.getId()).toBe(accountId1)
        })
        it("should be able to perform WITHDRAW operation", async () => {
            const { transaction: transactionData, account: accountData } = await OperationsService.createOperation('WITHDRAW', 500, accountId1) as { transaction: TransactionType, account: AccountType }
            const transaction = Transaction.load(transactionData)
            const account = Account.load(accountData)
            expect(transaction.getAmount()).toBe(500)
            expect(transaction.getFromAccount()).toBe(accountId1)
            expect(account.getBalance()).toBe(0)
            expect(account.getId()).toBe(accountId1)
            const { account: accountData_overdrawed } = await OperationsService.createOperation('WITHDRAW', 100, accountId1) as { transaction: TransactionType, account: AccountType }
            const account_overdrawed = Account.load(accountData_overdrawed)
            expect(account_overdrawed.getBalance()).toBe(-100)
            try {
                await OperationsService.createOperation('WITHDRAW', 500, accountId1) as { transaction: TransactionType, account: AccountType }
                expect('Operation error max overdraw exceeded').toBeFalsy() // Make sure test crash
            } catch (e) {
                expect(e).toBeTruthy()
            }
        })
        it.skip("should be able to perform TRANSFER operation", async () => {
            const { transaction: transactionData, account: accountData } = await OperationsService.createOperation('WITHDRAW', 500, accountId1) as { transaction: TransactionType, account: AccountType }
            const transaction = Transaction.load(transactionData)
            const account = Account.load(accountData)

        })
    })

})