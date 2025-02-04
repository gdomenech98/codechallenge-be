
import { Account, AccountType } from "../../models/Account";

describe('Unit Testing methods for Account Model', () => {
    describe('should be able to create an Account', () => {
        const accountData: AccountType = {
            accountId: "1234",
            ownerId: "4321",
            balance: 100
        }
        const account = new Account(accountData);
        describe("validation data for Account", () => {
            it("should validate data", () => {
                const accountData: AccountType = {
                    accountId: "1234",
                    ownerId: "4321",
                    balance: 100
                }
                try {
                    new Account(accountData)
                    expect('Validate healthcheck').toBeTruthy()
                } catch (e) {
                    expect(e).toBeFalsy()
                }
            })
            it("should fail validation no accountId specified", () => {
                const accountData = {
                    ownerId: "4321",
                    balance: 100
                }
                try {
                    new Account(accountData as AccountType)
                    expect("Error. missing accountId").toBeFalsy() // Intentionally crash
                } catch (e: any) {
                    expect(e.message).toBe("Account should have an accountId")
                }
            })
            it("should fail validation no accountId specified", () => {
                const accountData = {
                    accountId: "1234",
                    balance: 100
                }
                try {
                    new Account(accountData as AccountType)
                    expect("Error. missing ownerId").toBeFalsy() // Intentionally crash
                } catch (e:any) {
                    expect(e.message).toBe("Account should have an ownerId")
                }
            })
        })
        it("should load Account Model and retrieve back data from it", () => {
            const retrievedAccountData = account.getData();
            expect(retrievedAccountData).toStrictEqual(accountData) // Using "toStrictEqual" to avoid object references
        })
        it("should get Account identifier", () => {
            expect(account.getId()).toBe(accountData.accountId)
        })
        it("should retrieve Account owner identifier", () => {
            expect(account.getOwner()).toBe(accountData.ownerId)
        })
        it("should retrieve balance from Account", () => {
            expect(account.getBalance()).toBe(accountData.balance)
        })
        it("should can create an Account", () => {
            const account = Account.create(accountData.ownerId, accountData.accountId);
            const retrievedAccountData = account.getData();
            expect(retrievedAccountData).toStrictEqual({ ...accountData, balance: 0 })
        })
        it("should update account, with new instance, given a key with specified value", () => {
            const accountData_1: AccountType = {
                accountId: "1234",
                ownerId: "4321",
                balance: 100
            }
            const expectedAccountData: AccountType = {
                accountId: "1234",
                ownerId: "4321",
                balance: 22
            }
            const account_1 = new Account(accountData_1)
            const modifiedAccountData_1 = account_1.set('balance', 22).getData()
            expect(modifiedAccountData_1).toStrictEqual(expectedAccountData)
        })
        describe("test withdraw method", () => {
            it("should withdraw when balance doesn't overdraw the maximum overdraw allowed", () => {
                expect(account.getBalance()).toBe(100); // Check that initial balance is correct
                const WITHDRAW_AMOUNT = 50;
                const updatedAccount = account.withdraw(WITHDRAW_AMOUNT);
                expect(updatedAccount.getBalance()).toBe(account.getBalance() - WITHDRAW_AMOUNT)
            })
            it("should withdraw when balance doesn't overdraw the maximum overdraw allowed, checking balance is negative", () => {
                expect(account.getBalance()).toBe(100); // Check that initial balance is correct
                const WITHDRAW_AMOUNT = 150;
                const updatedAccount = account.withdraw(WITHDRAW_AMOUNT);
                expect(updatedAccount.getBalance()).toBe(-50)
            })
            it("should NOT withdraw when balance overdraw the maximum overdraw allowed throwing an error", () => {
                expect(account.getBalance()).toBe(100); // Check that initial balance is correct
                const WITHDRAW_AMOUNT = 500;
                try {
                    account.withdraw(WITHDRAW_AMOUNT);
                    expect('Not have error').toBeFalsy() // Make test crash intentionally, bc it's suposed to don't be able to withdraw
                } catch (error) {
                    expect(error).toBeTruthy()
                }
            })
        })
        describe("test deposit method", () => {
            it("should deposit when daily deposit quantity is not exceeded", () => {
                const TOTAL_DEPOSIT_LAST_24h = 4500
                const amount_to_deposit = 500
                expect(account.getBalance()).toBe(100); // Check that initial balance is correct
                const updatedBalance = account.deposit(amount_to_deposit, TOTAL_DEPOSIT_LAST_24h).getBalance()
                expect(updatedBalance).toBe(account.getBalance() + amount_to_deposit)
            })
            it("should not be able to diposit when daily deposit quantity is exceeded", () => {
                const TOTAL_DEPOSIT_LAST_24h = 5000
                const amount_to_deposit = 10
                expect(account.getBalance()).toBe(100); // Check that initial balance is correct
                try {
                    account.deposit(amount_to_deposit, TOTAL_DEPOSIT_LAST_24h).getBalance()
                    expect('Error could not deposit when daily deposit exceed 5000$').toBeFalsy()
                } catch (error) {
                    expect(error).toBeTruthy()
                }
            })
        })
        describe("test transfer method", () => {
            it("should transfer amount, decreasing account balance", () => {
                const updatedAccount = account.transfer(30);
                expect(updatedAccount.getBalance()).toBe(70)
            })
            it("should not transfer amount, overdraft exceed", () => {
                try {
                    account.transfer(101);
                    expect('Error: should crash, could not transfer specified amoun, overdraft exceeded').toBeFalsy() // Intentionally crash test
                } catch (e: any) {
                    expect(e.message).toBe("Can not overdraw in transfer")
                }
            })
        })
        describe("test recieveTransfer method", () => {
            const updatedAccount = account.recieveTransfer(30);
            it("should recieve transfer", () => {
                expect(updatedAccount.getBalance()).toBe(130)
            })
        })
    });
});