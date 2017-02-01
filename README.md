# api-airplane-mode
## Turn a Postman collection into a runnable offline API
### Setup

- `npm install`
- `npm install snapstub -g` (snazzy package that makes this all possible)

### Taking a snapshot

- Drop an up-to-date `*.postman_collection.json` and `*.postman_environment.json` file into `./postman_apis`
- Rename `config.json.example` to `config.json` and update with your filenames:
```
{
    "collectionFile": "./postman_apis/YOUR_COLLECTION.postman_collection.json",
    "environmentFile": "./postman_apis/YOUR_ENVIRONMENT.postman_environment.json"
}
```
- Run `npm start` and watch your API requests get downloaded into the `__mocks___` folder (thanks, [Snapstub](https://github.com/ruyadorno/snapstub)!).

### Running the offline API

- `snapstub start` to run your freshly updated offline API.

Point a client at http://127.0.0.1:8059 instead of your normal REST API url and start making offline requests!
