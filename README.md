# DeversiFi Celebrity Trader API

DeversiFi Celebrity Trader provides a backend that scan a list of accounts from twitter, gets the sentiment of the tweets and make a trade depending on the sentiment (Positive will buy ether and Negative will sell ether).

**Note:** The /app folder is divided in two parts, the code necessary to run the app with express server and the code to run with [Firebase Cloud Functions](https://firebase.google.com/docs/functions) .

## Express Server
 To install all packages and dependencies run:

```bash
  npm install
```

### Run Locally
To start the server locally, run:

```bash
  npm run start
```

To start the server with live-reload make sure you have [nodemon](https://www.npmjs.com/package/nodemon) installed on your machine, and then run:

```bash
  npm run server
```

## Trading API

On [this file](https://github.com/DeversiFi/dvf-celebrity-api/blob/7ff0519ebc1676d0229b7fda4fcee30d36753b45/app/src/functions/trade/trade.js) you can find the code that is used for trading, if a `tradeURL` is specified [here](https://github.com/DeversiFi/dvf-celebrity-api/blob/7ff0519ebc1676d0229b7fda4fcee30d36753b45/app/src/functions/trade/trade.js#L8), a call will be made to that endpoint, otherwise it will use [dvf-client-js](https://github.com/DeversiFi/dvf-client-js).


## Firebase Cloud Functions

### Setup
Make sure you have those things ready:
1. A firebase account and project created
2. Node.js
3. [Firebase Command Line Interface](https://www.npmjs.com/package/firebase-tools) installed on your machine so you can manage and deploy your firebase project from the command line

Log into your firebase account running:

```bash
  firebase login
```

To add your firebase project run:

```bash
  firebase use --add
```
**Note:** Make sure that .firebaserc file has your project name on it

### Installation
To install all packages and dependencies run the follow commands:

```bash
  npm install
  cd app/
  npm install
```

### Run Locally
The Firebase CLI includes a Cloud Functions emulator which can emulate:
- HTTPS functions
- Callable functions
- Cloud Firestore functions.
To use it run:
```bash
  firebase emulators:start
```

### Deploy Functions to Cloud
To deploy functions to the production environment run:

```bash
  firebase deploy --only functions
```