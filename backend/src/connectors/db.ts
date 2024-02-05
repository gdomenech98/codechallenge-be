import { MongoClient } from 'mongodb';

const DB_URL = "mongodb://localhost:27017/db"

export class DB {
    constructor(){}
    
    async list(collectionName: string, dbquery: any, showDeleted?: boolean) {
        const collection = this.getDB().collection(collectionName);
        if (!showDeleted) dbquery = { ...dbquery, _delete: { $exists: false } }
        const data = await collection.find(dbquery).toArray();
        if (data.length == 0) throw "Not found"
        return data
    }

    async read(collectionName: string, dbquery: any, showDeleted?: boolean) {
        const collection = this.getDB().collection(collectionName);
        if (!showDeleted) dbquery = { ...dbquery, _delete: { $exists: false } }
        const data = await collection.findOne(dbquery)
        if (!data) throw "Not found"
        return data
    }

    async create(collectionName: string, data: any) {
        const collection = this.getDB().collection(collectionName);
        try {
            await collection.insertOne(data)
            return data
        } catch (e) {
            if (e.code == 11000) throw "Duplicated key"
        }
    }

    async update(collectionName: string, dbquery: any, data: any) { // update One
        const collection = this.getDB().collection(collectionName);
        let dbData;
        try {
            dbData = await collection.replaceOne(dbquery, data)
        } catch (e) {
            if (e.code == 11000) throw "Duplicated key"
        }
        if (!dbData.matchedCount) throw "Not found"
        return data
    }

}