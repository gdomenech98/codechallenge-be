import { MongoClient } from 'mongodb';

const DB_URL = "mongodb://mongodb:27017/db"

export class MongoDB {
    public client: any;
    constructor(client: MongoClient) {
        this.client = client;
    }

    static async _newInstance(uri = DB_URL): Promise<MongoDB> {
        try {
            const client: MongoClient = await new MongoClient(uri).connect()
            return new this(client);
        } catch (e: any) {
            throw "Could not connect client"
        }
    }

    static async connect(uri?: string): Promise<MongoDB> {
        try {
            return MongoDB._newInstance(uri)
        } catch (e) {
            console.error("Failed to connect to: ", uri)
            throw e
        }
    }

    async close(): Promise<void> {
        await this.client.close()
    }

    private getDB() {
        return this.client.db()
    }

    async list(collectionName: string, dbquery: any, showDeleted?: boolean): Promise<any> {
        const collection = this.getDB().collection(collectionName);
        if (!showDeleted) dbquery = { ...dbquery, _delete: { $exists: false } }
        const data = await collection.find(dbquery).toArray();
        if (data.length == 0) throw "Not found"
        return data
    }

    async read(collectionName: string, dbquery: any, showDeleted?: boolean):Promise<any> {
        const collection = this.getDB().collection(collectionName);
        if (!showDeleted) dbquery = { ...dbquery, _delete: { $exists: false } }
        const data = await collection.findOne(dbquery)
        if (!data) throw "Not found"
        return data
    }

    async create(collectionName: string, data: any): Promise<any> {
        const collection = this.getDB().collection(collectionName);
        try {
            await collection.insertOne(data)
            return data
        } catch (e: any) {
            if (e.code == 11000) throw "Duplicated key"
        }
    }

    async createMany(collectionName: string, data: any[]): Promise<any> {
        const collection = this.getDB().collection(collectionName);
        try {
            await collection.insertMany(data);
        } catch (e) {
            console.error(e);
        }
    }

    async update(collectionName: string, dbquery: any, data: any): Promise<any> { // update One
        const collection = this.getDB().collection(collectionName);
        let dbData: any;
        try {
            dbData = await collection.replaceOne(dbquery, data)
        } catch (e: any) {
            if (e.code == 11000) throw "Duplicated key"
        }
        if (!dbData.matchedCount) throw "Not found"
        return data
    }

    async delete(collectionName: string, dbquery: any): Promise<any> { // Delete just adds "_delete" field to true, and read/list operations ommit these items
        const element = await this.read(collectionName, dbquery )
        return await this.update(collectionName, dbquery, {...element, _delete: true})
    }

    async generateIndex(collectionName: string, field: string, indexType: 'unique' | 'text'): Promise<void> { // recover one element deleted
        const collection = this.getDB().collection(collectionName);
        switch (indexType) {
            case 'unique':
                await collection.createIndex({ [field]: 1 }, { unique: true })
                break;
            case 'text':
                await collection.createIndex({ [field]: "text" })
                break;
        }
    }

}