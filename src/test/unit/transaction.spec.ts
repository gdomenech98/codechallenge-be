
import { Transaction, TransactionType } from "../../models/Transaction";

describe('Unit Testing methods for Transaction Model', () => {
    describe('should be able to create an Account', () => {
        const current_ts: number = Date.now();
        const transactionData: TransactionType = {
            id: '1',
            operation: "WITHDRAW",
            amount: 100,
            timestamp: current_ts,
            fromAccountId: "1234"
        }
        const transactionData_1: TransactionType = {
            id: '1',
            operation: "WITHDRAW",
            amount: 100,
            timestamp: current_ts,
            fromAccountId: "1234",
            toAccountId: "4321",
        }

        const transaction = Transaction.load(transactionData);
        const transaction_1 = Transaction.load(transactionData_1);

        it("should load Transaction Model and retrieve back data from it", () => {
            const retrievedTransactionData = transaction.getData();
            expect(retrievedTransactionData).toStrictEqual(retrievedTransactionData) // Using "toStrictEqual" to avoid object references
        })
        it("should get Transaction identifier", () => {
            expect(transaction.getId()).toBe(transactionData.id)
        })
        it("should retrieve Transaction 'from' identifier", () => {
            expect(transaction.getFromAccount()).toBe(transactionData.fromAccountId)
        })
        it("should retrieve Transaction 'to' identifier", () => {
            expect(transaction.getToAccount()).toBeUndefined() // Checks can retrieve even when not have "toAccountId"
            expect(transaction_1.getToAccount()).toBe(transactionData_1.toAccountId) // Checks can retrieve when  have "toAccountId"
        })
        it("should retrieve Transaction operation type", () => {
            expect(transaction.getOperationType()).toBe(transactionData.operation)
        })
        it("should retrieve Transaction timestamp", () => {
            expect(transaction.getTimestamp()).toBe(transactionData.timestamp)
        })
     
    });
});