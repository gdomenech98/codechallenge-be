export const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:3300"
export const API_PREFIX = '/api/v1'

export class API {
    constructor() {
    }
    static async get(path: string, prefix: string = API_PREFIX) {
        const URL = SERVER_URL + prefix + path
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) {
            const responseObj = {
                status: 'rejected',
                statusCode: response.status,
                url: response.url,
                statusText: response.statusText,
                mesage: response.body
            }
            throw Error(JSON.stringify(responseObj));
        }
    }
    static async post(path: string, body: any, prefix: string = API_PREFIX) {
        const URL = SERVER_URL + prefix + path
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const responseObj = {
                status: 'rejected',
                statusCode: response.status,
                url: response.url,
                statusText: response.statusText,
                mesage: response.body
            }
            throw Error(JSON.stringify(responseObj));
        }
        return response.json();
    }
}