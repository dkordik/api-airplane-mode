#!/usr/bin/env node

let fs = require('fs'),
    path = require('path'),

    pp = (input) => console.log(JSON.stringify(input, null, 2)),
    getPath = (relativePath) => path.join(process.cwd(), relativePath),
    read = (path) => JSON.parse(fs.readFileSync(getPath(path)).toString()),

    config = require('./config.json'),

    injectEnv = (str, env) => { //replaces {{someVar}} with the env value of someVar
        let tokens = [];
        str.replace(/(\{{2}([a-zA-Z0-9]+)\}{2})/g, (match, p1, p2) => {
            tokens.push({ bracketedString: p1, key: p2 });
        });
        tokens.forEach(({ bracketedString, key }) => {
            let environmentEntry = env.values.find(v => v.key === key);
            if (environmentEntry) {
                str = str.replace(bracketedString, environmentEntry.value);
            } else {
                console.error(`no environment entry found for: ${bracketedString}`);
            }
        });
        return str;
    };

const COLLECTION = read(config.collectionFile),
    ENVIRONMENT = read(config.environmentFile);

let snapstubAdd = require('snapstub/commands/add'),
    snapstubReadyEndpoints = COLLECTION.item.map(i => ({
        name: i.name,
        httpMethod: i.request.method,
        headers: i.request.header && i.request.header.map(h => {//ie. Content-Type: application/json
            return `${h.key}: ${h.value && injectEnv(h.value, ENVIRONMENT)}`
        }),
        url: i.request.url && injectEnv(i.request.url, ENVIRONMENT)
    }));
/*{
    "name": "My cool endpoint",
    "httpMethod": "GET",
    "headers": [ "Content-Type: application/json", "Authorization: Bearer 123" ],
    "url": "https://my.dynamic.environment.url/endpoint/123"
}*/

let snapstubPath = getPath('__mocks__'),
    snapstubPort = 8059;

console.log(`📸  Snapshotting "${COLLECTION.info.name}"...`);

snapstubReadyEndpoints.forEach((endpoint) => {
    console.log(`🔌  "${endpoint.name}"`);
    snapstubAdd({
        argv: { //snapstub reverse command lining! :D
            method: endpoint.httpMethod.toLowerCase(),
            //^ lowercase so snapstub's "got" library works right
            _: [ null, endpoint.url ],
            header: endpoint.headers
        },
        rootPath: snapstubPath
    });
});

console.log('😎  Sit tight, this could take some time... will close when complete.');
