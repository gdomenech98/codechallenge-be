
import { Account, AccountType } from "../../models/Account";

describe('Unit Testing methods for Account Model', () => {
    describe('should be able to create an Account', () => {
        const accountData: AccountType = {
            accountId: "1234",
            ownerId: "4321",
            balance: 100
        }
        it("checks that can load Account Model and retrieve back data from it", () => {
            const account = Account.load(accountData);
            const retrievedAccountData = account.getData();
            expect(retrievedAccountData).toStrictEqual(accountData) // Using "toStrictEqual" to avoid object references
        })
        it("checks that can create an Account", () => {
            const account = Account.create(accountData.ownerId, accountData.accountId);
            const retrievedAccountData = account.getData();
            expect(retrievedAccountData).toStrictEqual({ ...accountData, balance: 0 })
        })
    });
});