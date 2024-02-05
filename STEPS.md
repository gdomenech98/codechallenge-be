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
7. Introduce docker in order to add db and solve infra / service discovery with db/backend (db choosen is mongodb due to flexibility)
8. Create db connector with basic (sooo basic!) LCRUD operations and connection to db service. Add infra tests for this connector.
9. Create 'repositories' encapsulation for db calls (infra) with the domain
10. Create 'services', classes that operate with models and handle the business logic and interactions with models.