import { v4 as uuidv4 } from 'uuid';
import { Account, AccountType } from '../../models/Account';
import { AccountRepository } from '../../repositories/AccountRepository';
import { OperationType } from '../../services/OperationsService';
import { API } from '../../connectors/API';
import { MongoDB } from '../../connectors/db';


describe("test endpoints", () => {
    let accountId1: string | undefined
    let ownerId1: string | undefined
    let accountId2: string | undefined
    let ownerId2: string | undefined
    let account1: Account | undefined
    let account2: Account | undefined
    let response
    let accountRepository: AccountRepository;
    let db: MongoDB
    beforeAll(async () => {
        db = await MongoDB.connect()
        accountRepository = new AccountRepository(db)
    })

    afterAll(async () => {
        await db.close()
    })

    beforeEach(async () => {
        accountId1 = uuidv4()
        ownerId1 = uuidv4()
        accountId2 = uuidv4()
        ownerId2 = uuidv4()
        account1 = Account.create(ownerId1, accountId1)
        account2 = Account.create(ownerId2, accountId2)

        try {
            await accountRepository.create(account1.getData())
            await accountRepository.create(account2.getData())
        } catch (e) {
            throw new Error("Could not create accounts")
        }
    })

    // TODO account repository 
    it("should deposit specific amount to specific account", async () => {
        try {
            const api = new API()
            response = await api.post("/deposit", {
                accountId: accountId1,
                amount: 300
            });
            expect(new Account((response as OperationType).account).getBalance()).toBe(300)
        } catch (e) {
            expect(e).toBeFalsy()
        }
    })

    it("should not be able to deposit specific amount exceed daily deposit amount", async () => {
        try {
            const api = new API()
            response = await api.post("/deposit", {
                accountId: accountId1,
                amount: 30000
            });
            expect('Error: could not deposit overdraw').toBeFalsy()
        } catch (e) {
            expect(e).toBeTruthy()
        }
    })

    it("should withdraw specific amount from specific account", async () => {
        try {
            // First deposit
            const api = new API()
            await api.post("/deposit", { accountId: accountId1, amount: 200 });
            response = await api.post("/withdraw", {
                accountId: accountId1,
                amount: 180
            });
            expect(new Account((response as OperationType).account).getBalance()).toBe(20)
        } catch (e) {
            expect(e).toBeFalsy()
        }
    })

    it("should withdraw specific and get negative but preserving max overdraft", async () => {
        try {
            const api = new API()
            response = await api.post("/withdraw", {
                accountId: accountId1,
                amount: 180
            });
            expect(new Account((response as OperationType).account).getBalance()).toBe(-180)
        } catch (e) {
            expect(e).toBeFalsy()
        }
    })

    it("should not withdraw specific amount due that exceed max overdraft", async () => {
        try {
            const api = new API()
            response = await api.post("/withdraw", {
                accountId: accountId1,
                amount: -280
            });
            expect("Error can't perform withdraw, exceeded max overdraft").toBeFalsy()
        } catch (e) {
            expect(e).toBeTruthy()
        }
    })

    it("should transfer specific amount from account to another account", async () => {
        // First deposit
        const api = new API()
        await api.post("/deposit", { accountId: accountId1, amount: 100 });
        try {
            response = await api.post("/transfer", {
                fromAccountId: accountId1,
                toAccountId: accountId2,
                amount: 50
            });
            expect(new Account((response as OperationType).account).getBalance()).toBe(50)
            expect(new Account((response as OperationType).destinataryAccount as AccountType).getBalance()).toBe(50)

        } catch (e) {
            expect(e).toBeFalsy()
        }
    })

    it("should not be able to transfer negative amount", async () => {
        try {
            const api = new API()
            response = await api.post("/transfer", {
                fromAccountId: accountId1,
                toAccountId: accountId2,
                amount: -50
            });
            expect('Error could not transfer negative amount').toBeFalsy()
        } catch (e) {
            expect(e).toBeTruthy()
        }
    })

    it("should not be able to transfer from  non existing account", async () => {
        try {
            const api = new API()
            response = await api.post("/transfer", {
                fromAccountId: 'novalidid',
                toAccountId: accountId2,
                amount: 50
            });
            expect('Error could not transfer from provided account').toBeFalsy()
        } catch (e) {
            expect(e).toBeTruthy()
        }
    })

    it("should not be able to transfer to a non existing account", async () => {
        try {
            const api = new API()
            response = await api.post("/transfer", {
                fromAccountId: accountId1,
                toAccountId: 'novalidid',
                amount: 50
            });
            expect('Error could not transfer to provided account').toBeFalsy()
        } catch (e) {
            expect(e).toBeTruthy()
        }
    })

    it("should not be able to transfer  the amount when over pass 'from' account balance", async () => {
        const api = new API()
        await api.post("/deposit", { accountId: accountId1, amount: 100 });
        try {
            response = await api.post("/transfer", {
                fromAccountId: accountId1,
                toAccountId: accountId2,
                amount: 101
            });
            expect('Error could not transfer the desired amount, no have enough balance').toBeFalsy()
        } catch (e) {
            expect(e).toBeTruthy()
        }
    })

})