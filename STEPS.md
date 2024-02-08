# Run system
1. First check that have installed docker and docker-compose. Tested environment specifications:
```
OS: [ Unix MacOS (Ventura), Ubuntu-22.04LTS]
NodeJS: [v20.4.0, v20.5.0]
Docker: Docker version 24.0.5, build ced0996
Docker-compose: Docker Compose version v2.20.2-desktop.1
```
2. ONLY FOR DEVELOPMENT PURPOSES. development mode with hotreload `./dev`
2.1. RUN TESTS IN PROD MODE TO HEALTHCECK: `./test` (with `./dev` running)
3. FOR PRODUCTION: `./prod`

# Steps/decisions made 
1. npm install
2. Check app by default is working:
`
npm run build
npm run start
check http://localhost:3300/dummy returns "something!"
` 
3. Create a dev environment to enhance development cycle:
- Add ts-node-dev a "hot reload" compiler for typescript
`
npm i ts-node-dev --save-dev 
`
- Add script at package.json to run in dev mode:
`
{ 
    "scripts": {
        ...,
        "dev": "ts-node-dev --respawn --pretty --transpile-only src/app/main.ts",
    }
}
`
- Now can run in dev mode with hot reload using: `npm run dev`
4. Check that testing environment is setup and working `npm run test`
5. Create some models that emerged: Account and Transactions at `src/models/*`
6. Validate some methods of the models created using TDD with jest. Create first unit tests for each model.
7. Introduce docker/docker-compose in order to add db and solve infra / service discovery with db/backend (db choosen is mongodb due to flexibility). Add scripts `dev` to start docker (Unix script!)
8. Create db connector with basic (sooo basic!) LCRUD operations and connection to db service. Add infra tests for this connector.
9. Create 'repositories' encapsulation for db calls (infra) with the domain. The repositories just fetch data and return "raw" data, don't operate with models due that, at the moment, I want flexibility and the data management through infra be just "raw" data and not models.
10. Create 'services', classes that operate with models and handle the business logic and interactions with models. TDD each operation performed at `services/OperationsService.ts`
11. Create endpoints (deposit/transfer/withdraw) at App.ts. Add prefix `/api/v1`
12. Add body parser middleware to express app to handle JSON encoded body
13. Test endpoints `infraRouting.specs.ts`
14. **MY EXTRA MILE!**: Add CI/CD that runns tests in GithubActions!
(on each step i've refactored some of the code when emerged new implementations or discover the real usability of functions)


# Considerations:
- Deposits can not be above $5000 per day --> I consider a day 24h from the moment action is performed, not natural days.
- Now actions over accounts (withdraw, transfer, deposit) can be performed by anyone that knows account id, should add (in the future) any type of validation over, for example, JWT tokens.
- Account and Transaction are 2 separated entities to have more flexibility to extend behaviour
- Account have ownerId, but there is no User/Profile model, assuming its already created
- Not created a CRUD API to create accounts, can do it through running tests, or with mongo GUI available at `http:localhost:8081/db/db/accounts`. User and password for mongodb GUI are
`user:changeme` located over `ME_CONFIG_BASICAUTH_USERNAME` and `ME_CONFIG_BASICAUTH_PASSWORD` respectively, configured at docker-compose.dev.yml

# Possible improvements:
- Fix warning `A worker process has failed to exit gracefully...`` at test `should be able to perform TRANSFER operation` in `operationsService.spec.ts`
- Could improve production environments to optimize docker container sizes/resources
- dev and prod share ports, could change it to have different ports in prod and dev.
- Add regex to jest config to avoid jest from executing tests at /dist
- Operations in accounts/transacitons should be atomic, and reverse if any of the operation steps fails.