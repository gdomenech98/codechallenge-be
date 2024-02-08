import { v4 as uuidv4 } from 'uuid';
import { OperationResponse, OperationsService } from '../../services/OperationService';
import { Transaction } from '../../models/Transaction';
import { Account, AccountType } from '../../models/Account';
import { TransactionRepository } from '../../repositories/TransactionRepository';
import { AccountRepository } from '../../repositories/AccountRepository';
import { MongoDB } from '../../connectors/db';

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
    let accountRepository: AccountRepository;
    let transactionRepository: TransactionRepository;
    let db: MongoDB
    beforeAll(async () => {
        // Save accounts to db
        db = await MongoDB.connect()
        transactionRepository = new TransactionRepository(db)
        accountRepository = new AccountRepository(db);
        await accountRepository.create(account1.getData());
        await accountRepository.create(account2.getData());
        // Transaction 1 from 1 to 2
        transaction1_f1_t2 = Transaction.create('DEPOSIT', 300, accountId1, undefined, transactionId1)
        // Transaction 2 from 1 to 2
        transaction2_f1_t2 = Transaction.create('DEPOSIT', 700, accountId1, undefined, transactionId2)
        // Transaction 3 from 1 to 2 (more than 24h)
        transaction3_f1_t2_outdated = Transaction.create('DEPOSIT', 500, accountId1, undefined, transactionId3, (new Date().getTime() - (25 * 60 * 60 * 1000)))
        // Save transactions to db
        await transactionRepository.create(transaction1_f1_t2.getData())
        await transactionRepository.create(transaction2_f1_t2.getData())
        await transactionRepository.create(transaction3_f1_t2_outdated.getData())
    })
    afterAll(async () => {
        await db.close()
    })
    it('should retrieve all created accounts (in this test)', async () => {
        const accounts = await accountRepository.list({
            accountId: {
                $in: [accountId1, accountId2]
            }
        });
        expect(accounts).toHaveLength(2)
    })
    it('should retrieve all created transactions (in this test)', async () => {
        const transactions = await transactionRepository.list({
            id: {
                $in: [transactionId1, transactionId2, transactionId3]
            }
        });
        expect(transactions).toHaveLength(3)
    })
    it('should be able to retrieve specific accounts by accountId', async () => {
        const accounts = await accountRepository.list({ accountId: accountId1 })
        expect(accounts).toHaveLength(1)
    })
    it('should be able to retrieve specific transactiosn', async () => {
        const transactions = await transactionRepository.list({ id: transactionId1 })
        expect(transactions).toHaveLength(1)

    })
    it('should be able to retrieve specific account by ownerId', async () => {
        const accountData = await accountRepository.read({ ownerId: ownerId1 })
        expect(new Account(accountData).getOwner()).toBe(ownerId1)
    })

    describe('test operation service', () => {
        const operationService = new OperationsService();
        beforeAll(async () => {
            await operationService.init()
        })
        it("should be able to perform DEPOSIT operation", async () => {
            const { transaction: transactionData, account: accountData } = await operationService.createOperation({ operation: 'DEPOSIT', amount: 500, fromAccountId: accountId1 }) 
            const transaction = new Transaction(transactionData)
            const account = new Account(accountData)
            expect(transaction.getAmount()).toBe(500)
            expect(transaction.getFromAccount()).toBe(accountId1)
            expect(account.getBalance()).toBe(500)
            expect(account.getId()).toBe(accountId1)
        })
        it("should be able to perform WITHDRAW operation", async () => {
            const { transaction: transactionData, account: accountData } = await operationService.createOperation({ operation: 'WITHDRAW', amount: 500, fromAccountId: accountId1 })
            const transaction = new Transaction(transactionData)
            const account = new Account(accountData)
            expect(transaction.getAmount()).toBe(500)
            expect(transaction.getFromAccount()).toBe(accountId1)
            expect(account.getBalance()).toBe(0)
            expect(account.getId()).toBe(accountId1)
            const { account: accountData_overdrawed } = await operationService.createOperation({ operation: 'WITHDRAW', amount: 100, fromAccountId: accountId1 }) 
            const account_overdrawed = new Account(accountData_overdrawed)
            expect(account_overdrawed.getBalance()).toBe(-100)
            try {
                await operationService.createOperation({ operation: 'WITHDRAW', amount: 500, fromAccountId: accountId1 }) 
                expect('Operation error max overdraw exceeded').toBeFalsy() // Make sure test crash
            } catch (e) {
                expect(e).toBeTruthy()
            }
        })
        describe("should be able to perform TRANSFER operation", () => {
            let accountId3: string | undefined
            let accountId4: string | undefined
            let ownerId3: string | undefined
            let ownerId4: string | undefined
            let account3: Account | undefined
            let account4: Account | undefined
            let account3Data: AccountType | undefined
            let account4Data: AccountType | undefined

            beforeAll(async () => {
                // Instance new accounts
                accountId3 = uuidv4()
                accountId4 = uuidv4()
                ownerId3 = uuidv4()
                ownerId4 = uuidv4()
                account3 = Account.create(ownerId3, accountId3)
                account4 = Account.create(ownerId4, accountId4)
                await accountRepository.create(account3.getData())
                await accountRepository.create(account4.getData())
                account3Data = await accountRepository.read({ accountId: accountId3 })
                account4Data = await accountRepository.read({ accountId: accountId4 })
                expect(new Account(account3Data).getBalance()).toBe(0)
                expect(new Account(account4Data).getBalance()).toBe(0)
                // Deposit at account 3 -> 300$
                await operationService.createOperation({ operation: 'DEPOSIT', amount: 300, fromAccountId: accountId3 })
                account3Data = await accountRepository.read({ accountId: accountId3 })
                account4Data = await accountRepository.read({ accountId: accountId4 })
                expect(new Account(account3Data).getBalance()).toBe(300);
                expect(new Account(account4Data).getBalance()).toBe(0);
            })
            it("should transfer specific amount from->to accounts", async () => {
                const { transaction, account: accountData_from, destinataryAccount: accountData_to } = await operationService.createOperation({ operation: 'TRANSFER', amount: 300, fromAccountId: accountId3 as string, toAccountId: accountId4 }) 
                expect(new Account(accountData_from).getBalance()).toBe(0);
                expect(new Account(accountData_to as AccountType).getBalance()).toBe(300);
                expect(new Transaction(transaction).getFromAccount()).toBe(accountId3);
                expect(new Transaction(transaction).getToAccount()).toBe(accountId4);
            })
            it("should not perform transfer without toAccountId", async () => {
                try {
                    await operationService.createOperation({ operation: 'TRANSFER', amount: 300, fromAccountId: accountId3 as string })
                    expect("Error: can't transfer without specify the destinatary").toBeFalsy()
                } catch (error) {
                    expect(error).toBeTruthy()
                }
            })
            it("should not perform transfer with wrong fromAccount", async () => {
                try {
                    await operationService.createOperation({ operation: 'TRANSFER', amount: 300, fromAccountId: "1234", toAccountId: accountId4 })
                    expect("Error: can't transfer transferer without valid account id, make sure it exist").toBeFalsy()
                } catch (error: any) {
                    expect(error.message).toBe("Account doesn't exist")
                }
            })
            it("should not perform transfer with wrong toAccount", async () => {
                try {
                    await operationService.createOperation({ operation: 'TRANSFER', amount: 300, fromAccountId: accountId3 as string, toAccountId: "1234" })
                    expect("Error: can't transfer transferer without valid destinatary account id, make sure it exist").toBeFalsy()
                } catch (error: any) {
                    expect(error.message).toBe("Error: can't perform transfer, desinatary account doesn't exist.")
                }
            })
            it("should not be able to transfer with overdraft", async () => {
                try {
                    account3Data = await accountRepository.read({ accountId: accountId3 })
                    expect(new Account(account3Data).getBalance()).toBe(0) // Check balance is 0
                    await operationService.createOperation({ operation: 'TRANSFER', amount: 300, fromAccountId: accountId3 as string, toAccountId: accountId4 })
                    expect("Error: can't transfer exceeding outdraw").toBeFalsy()
                } catch (error: any) {
                    expect(error.message).toBe('Can not overdraw in transfer')
                }
            })

        })
    })

})