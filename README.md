## Prerequisites

Before you begin, ensure you have met the following requirements:
- You have installed [Node.js](https://nodejs.org/) (version 14.x or later)
- You have installed [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- You have installed [MongoDB](https://www.mongodb.com/)
- You have installed [Express.js](https://expressjs.com/) (if not included in your project dependencies)

## Note about TinyMCE

If you see the message "All created TinyMCE editors are configured to be read-only." in the console (F12), it means that the current TinyMCE configuration is set to read-only mode. To resolve this issue, please create a new TinyMCE account and update your TinyMCE API key in the project configuration.

1. Go to [TinyMCE](https://www.tiny.cloud/) and create a new account.
2. Obtain your new API key from the TinyMCE dashboard.
3. Update the TinyMCE API key in your project configuration file (e.g., `.env` or `config.js`).

## First, clone repository or download Zip

## To start setting up the project

Step 1: cd into the to cloned/Downloaded folder

```bash
yarn install
```
Step 2: Put your credentials in the /config/connection. file

```bash
PORT=3000
-If you choose to not change anything, the URI is our online MONGODB URI
-If you choose to see changes, please change from 
"await mongoose.connect(process.env.MONGODB_URI)" to:
"await mongoose.connect("mongodb://127.0.0.1:27017/InternChoice")"

Step 3: Install MongoDB (Linux Ubuntu) 

(Skip step if already have)
See <https://docs.mongodb.com/manual/installation/> for more infos

Step 4: Run Mongo daemon

```bash
sudo service mongod start
```
Step 5: Start the app by

```bash
npm start
```
