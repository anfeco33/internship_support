## Prerequisites

Before you begin, ensure you have met the following requirements:
- You have installed [Node.js](https://nodejs.org/) (version 14.x or later)
- You have installed [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- You have installed [MongoDB](https://www.mongodb.com/)
- You have installed [Express.js](https://expressjs.com/) (if not included in your project dependencies)

## Admin Account
email: admin@gmail.com
password: admin

## Student Account 
You can create one and add an attribute [otp: {random 6 numbers}].

## Company Account
You can normally create one by any email address.

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
