
import { Account, AccountType } from "../../models/Account";

describe('Unit Testing methods for Account Model', () => {
    describe('should be able to create an Account', () => {
        const accountData: AccountType = {
            accountId: "1234",
            ownerId: "4321",
            balance: 100
        }
        const account = Account.load(accountData);
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
    });
});