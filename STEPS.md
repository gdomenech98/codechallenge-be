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