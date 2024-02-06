
import exp from "constants";
import { Transaction, TransactionCollection, TransactionType } from "../../models/Transaction";

describe('Unit Testing methods for Transaction Model', () => {
    describe('should be able to operate with Transaction', () => {
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
            operation: "TRANSFER",
            amount: 100,
            timestamp: current_ts,
            fromAccountId: "1234",
            toAccountId: "4321",
        }

        const transaction = Transaction.load(transactionData);
        const transaction_1 = Transaction.load(transactionData_1);

        describe("should validate data to generate Transaction", () => {
            it('should validate transaction data', () => {
                expect(Transaction.validate(transactionData)).toBe(true)
            })
            it('should fail validation, missing amount', () => {
                const transactionData = {
                    id: '1',
                    operation: "WITHDRAW",
                    timestamp: current_ts,
                    fromAccountId: "1234"
                }
                try {
                    Transaction.validate(transactionData as TransactionType)
                    expect('Error. missing amount').toBeFalsy() // Intentionally crash
                } catch (e) {
                    expect(e).toBe('Transaction should have a possitive amount')
                }
            })
            it('should fail validation, negative amount', () => {
                const transactionData = {
                    id: '1',
                    operation: "WITHDRAW",
                    timestamp: current_ts,
                    fromAccountId: "1234",
                    amount: -10
                }
                try {
                    Transaction.validate(transactionData as TransactionType)
                    expect('Error. missing amount').toBeFalsy() // Intentionally crash
                } catch (e) {
                    expect(e).toBe('Transaction should have a possitive amount')
                }
            })
            it('should fail validation, missing operation', () => {
                const transactionData = {
                    id: '1',
                    timestamp: current_ts,
                    fromAccountId: "1234",
                    amount: 100
                }
                try {
                    Transaction.validate(transactionData as TransactionType)
                    expect('Error. missing operation').toBeFalsy() // Intentionally crash
                } catch (e) {
                    expect(e).toBe('Transaction must specify an operation')
                }
            })
            it('should fail validation, invalid operation', () => {
                const transactionData = {
                    id: '1',
                    operation: 'INVALID_OPERATION',
                    timestamp: current_ts,
                    fromAccountId: "1234",
                    amount: 100
                }
                try {
                    Transaction.validate(transactionData as TransactionType)
                    expect('Error. invalid operation').toBeFalsy() // Intentionally crash
                } catch (e) {
                    expect(e).toBe('Invalid operation for transaction')
                }
            })
            it('should fail validation, missing fromAccount', () => {
                const transactionData = {
                    id: '1',
                    operation: 'WITHDRAW',
                    timestamp: current_ts,
                    amount: 100
                }
                try {
                    Transaction.validate(transactionData as TransactionType)
                    expect('Error. missing fromAccount').toBeFalsy() // Intentionally crash
                } catch (e) {
                    expect(e).toBe('Transaction should have an fromAccountId')
                }
            })
            it('should fail validation, missing toAccount (with operation "TRANSFER")', () => {
                const transactionData = {
                    id: '1',
                    operation: 'TRANSFER',
                    fromAccountId: '1234',
                    timestamp: current_ts,
                    amount: 100
                }
                try {
                    Transaction.validate(transactionData as TransactionType)
                    expect('Error. missing toAccountId').toBeFalsy() // Intentionally crash
                } catch (e) {
                    expect(e).toBe('Transaction of type TRANSFER must specify a destination account')
                }
            })

            it('should fail validation, fromAccountId should be different to toAccountId (with operation "TRANSFER")', () => {
                const transactionData = {
                    id: '1',
                    operation: 'TRANSFER',
                    fromAccountId: '1234',
                    toAccountId: '1234',
                    timestamp: current_ts,
                    amount: 100
                }
                try {
                    Transaction.validate(transactionData as TransactionType)
                    expect("Error. can't have same fromAccountId and toAccountId").toBeFalsy() // Intentionally crash
                } catch (e) {
                    expect(e).toBe("Transaction couldn't have same source and destinatary account")
                }
            })
        })
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
                } catch (error) {
                    expect(error).toBeTruthy()
                }
            })
            it("creates transaction with toAccountId and operation different to 'TRANSFER'", () => {
                const initialData: TransactionType = {
                    id: "1",
                    operation: "WITHDRAW",
                    amount: 200,
                    fromAccountId: "1234",
                    timestamp: Date.now()
                }
                const transaction_withdraw = Transaction.create(initialData.operation, initialData.amount, initialData.fromAccountId, undefined, initialData.id)
                const transaction_withdrawData = transaction_withdraw.getData()
                expect(transaction_withdrawData).toStrictEqual(transaction_withdrawData)
            })
            it("creates transaction with toAccountId and operation different to 'TRANSFER'", () => {
                const initialData: TransactionType = {
                    id: "1",
                    operation: "WITHDRAW",
                    amount: 200,
                    fromAccountId: "1234",
                    timestamp: Date.now()
                }
                const transaction_withdraw = Transaction.create(initialData.operation, initialData.amount, initialData.fromAccountId, undefined, initialData.id)
                expect(transaction_withdraw.getData()).toStrictEqual(initialData)
            })
        })
    });
});
describe('Unit Testing methods for TransactionCollection', () => {
    const transactionData_1: TransactionType = {
        id: '1',
        operation: "WITHDRAW",
        amount: 100,
        timestamp: Date.now(),
        fromAccountId: "1234"
    }
    const transactionData_2: TransactionType = {
        id: '2',
        operation: "WITHDRAW",
        amount: 100,
        timestamp: Date.now(),
        fromAccountId: "4321",
    }
    const transactionArr = [transactionData_1, transactionData_2];
    const transactionCollection = TransactionCollection.load(transactionArr);
    it("should retrieve transaction collection length", () => {
        expect(transactionCollection.length()).toBe(2)
    })
    it("should retrieve items from transaction collection", () => {
        expect(transactionCollection.getItems()[0]).toStrictEqual(Transaction.load(transactionData_1))
        expect(transactionCollection.getItems()[1]).toStrictEqual(Transaction.load(transactionData_2))
    })
    it("should retrieve total amount from transaction collection", () => {
        expect(transactionCollection.totalAmount()).toBe(200)
    })
})