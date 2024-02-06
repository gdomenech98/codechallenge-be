import express, { Express, Request, Response } from "express";
import { Server, IncomingMessage, ServerResponse } from "http";
import { OperationsService } from "../services/OperationsService";


export class App {
    public readonly express: Express = express();
    private readonly port: Number;
    private server: Server | undefined;

    constructor(port: number) {
        this.port = port;
        this.initializeMiddleware()
    }

    private initializeMiddleware(): void {
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: true }));
    }

    start(): void {
        this.express.post('/api/v1/deposit', async (request: Request, response: Response) => {
            const { accountId, amount } = request.body as { accountId: string, amount: number };
            if (!accountId) response.send('Error account is not specified').status(400)
            if (!amount) response.send('Error deposits must have positive amount').status(400)
            try {
                const result = await OperationsService.createOperation('DEPOSIT', amount, accountId)
                response.json(result)
            } catch (e) {
                response.status(500).send(e)
            }
        })

        this.express.post('/api/v1/withdraw', async (request: Request, response: Response) => {
            const { accountId, amount } = request.body as { accountId: string, amount: number };
            if (!accountId) response.send('Error account is not specified').status(400)
            if (!amount) response.send('Error deposits must have positive amount').status(400)
            try {
                const result = await OperationsService.createOperation('WITHDRAW', amount, accountId)
                response.json(result)
            } catch (e) {
                response.status(500).send(e)
            }
        })

        this.express.post('/api/v1/transfer', async (request: Request, response: Response) => {
            const { fromAccountId, toAccountId, amount } = request.body;
            if (!fromAccountId) response.send('Error from account is not specified').status(400)
            if (!toAccountId) response.send('Error to account is not specified').status(400)
            if (!amount) response.send('Error deposits must have positive amount').status(400)
            try {
                const result = await OperationsService.createOperation('TRANSFER', amount, fromAccountId, toAccountId)
                response.json(result)
            } catch (e) {
                response.status(500).send(e)
            }
        })

        this.express.get('/api/v1/healthcheck', (request: Request, response: Response) => {
             response.send("Running!")
ﬁ       })
        
        this.server = this.express.listen(this.port)
    }

    stop(): void {
        this.server?.close();
    }
}


