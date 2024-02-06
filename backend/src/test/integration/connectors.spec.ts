import { MongoDB } from "../../connectors/db"
import { v4 as uuidv4 } from 'uuid';

describe("test db connector 'mongodb' operations", () => {
    const COLLECTION = 'test'
    let db: MongoDB;
    beforeEach(async () => {
        db = await MongoDB.connect();
    })
    afterEach(async () => {
        await db.close()
    })
    it('should create a db instance (client)', async () => {
        const client = db.client
        expect(client).not.toBeUndefined()
    })
    it('should create a unique index for "id" field', async () => {
        try {
            await db.generateIndex(COLLECTION, 'id', 'unique')
            expect(true).toBe(true)
        } catch (error: any) {
            expect('Error generating index').toBeFalsy() // Make sure crash when generateIndex fail
        }
    })
    describe('test LCRUD operations', () => {
        const randomId1 = uuidv4()
        const randomId2 = uuidv4()
        const data1 = { id: randomId1, name: 'jon' }
        const data2 = { id: randomId2, name: 'elisse' }
        it('should create a db document', async () => {
            const insertedData1 = await db.create(COLLECTION, data1)
            expect(insertedData1).toStrictEqual(data1)
            const insertedData2 = await db.create(COLLECTION, data2)
            expect(insertedData2).toStrictEqual(data2)
        })
        it('should update a db document', async () => {
            const updatedData = { id: randomId1, name: 'bob' }
            const insertedData = await db.update(COLLECTION, { id: randomId1 }, updatedData)
            expect(insertedData).toStrictEqual(insertedData)
        })
        it('should list all db documents', async () => {
            const insertedData = await db.list(COLLECTION, {})
            expect(insertedData).toHaveLength(2)
        })
        it('should read specific db document', async () => {
            const insertedData = await db.read(COLLECTION, { id: randomId2 })
            expect(insertedData).toStrictEqual(data2)
        })
        it('should delete specific db document', async () => {
            const deletedData2 = await db.delete(COLLECTION, { id: randomId2 })
            expect(deletedData2).toStrictEqual({ ...data2, _delete: true })
            expect(await db.list(COLLECTION, {})).toHaveLength(1)
            const deletedData1 = await db.delete(COLLECTION, { id: randomId1 })
            expect(deletedData1).toStrictEqual({ ...deletedData1, _delete: true })
            try{
                await db.list(COLLECTION, {})
                expect('List has no items, should throw an exception').toBeFalsy();
            }catch(e: any){
                expect(e.message).toBe('Not found')
            }
        })
    })
})