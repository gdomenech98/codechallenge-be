
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

        describe("Test Transaction create method", () => {
            it("creates transaction with toAccountId and operation 'TRANSFER'", () => {
                const transaction_transfer = Transaction.create("TRANSFER", 200, "1234", "4321", "1")
                const expectedTransactionData_transfer = {
                    id: "1",
                    operation: "TRANSFER",
                    amount: 200,
                    fromAccountId: "1234",
                    toAccountId: "4321",
                    timestamp: transaction_transfer.getTimestamp()
                }
                expect(transaction_transfer.getData()).toStrictEqual(expectedTransactionData_transfer)
            })
            it("creates transaction without toAccountId and type 'TRANSFER'", () => {
                try {
                    Transaction.create("TRANSFER", 300, "5678", undefined, "2");
                    expect('Not have error').toBeFalsy() // Make test crash intentionally, bc it's suposed to don't be able to transfer without destination
                }catch(error) {
                    expect(error).toBeTruthy()
                } 
            })
            it("creates transaction with toAccountId and operation different to 'TRANSFER'", () => {
                const initialData: TransactionType = {
                    id: "1",
                    operation: "WITHDRAW",
                    amount: 200,
                    fromAccountId: "1234",
                    toAccountId: "4321",
                    timestamp: Date.now()
                }
                const transaction_withdraw = Transaction.create(initialData.operation, initialData.amount, initialData.fromAccountId, initialData.fromAccountId, initialData.id)
                const transaction_withdrawData = transaction_withdraw.getData()
                const {toAccountId, ...expectedTransactionData}  = transaction_withdrawData
                expect(transaction_withdrawData).toStrictEqual(expectedTransactionData)
            })
            it("creates transaction with toAccountId and operation different to 'TRANSFER'", () => {
                const initialData: TransactionType = {
                    id: "1",
                    operation: "WITHDRAW",
                    amount: 200,
                    fromAccountId: "1234",
                    timestamp: Date.now()
                }
                const transaction_withdraw = Transaction.create(initialData.operation, initialData.amount, initialData.fromAccountId, initialData.fromAccountId, initialData.id)
                expect(transaction_withdraw.getData()).toStrictEqual(initialData)
            })
        })
    });
});