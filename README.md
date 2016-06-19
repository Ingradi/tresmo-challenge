## Tresmo challenge: Wine-API
### Quick start
##### Prerequisites
- Download and install MongoDB
- Start mongoDB

```bash
# clone repo
https://github.com/Ingradi/tresmo-challenge.git

# change directory to our repo
cd tresmo-challenge

# install the repo with npm
npm install

# run tests
npm test

# run integration tests
npm run test:integration

# set environment varibales or create an .env file with
# MONGODB_URI=[url to your mongoDB (eg mongodb://localhost/wine-app)]
# PORT=[port for server, default 8080]

# start the server
npm start
```

You can access wine api on [http://localhost:8080](http://0.0.0.0:8080) (or other configured port)