### Constituents API

#### Local dev requirements

- nvm
- docker

#### Running

- use node 20 `nvm use 20`
- install requirements `npm ci`
- start up the local postgres instance `docker-compose up`
- ensure you have a .env file in the directory root with `DB_URL=postgresql://postgres:postgres@localhost:5432/indigov`
- run server `npm run local`

#### Project Overview
The goal is to have a working API to store, list, and export CSVs of constituents.
To do so I created the following API operations:

##### PUT constituent
- stores the signup data with a primary key of email address. If email address exists already and the other properties are updated, this gets reflected in the database.
```
curl --location --request PUT 'http://localhost:8080/v0/constituents/pkatz@gmail.com' \
--header 'Content-Type: application/json' \
--data '{
    "firstName": "Peter",
    "lastName": "Katz",
    "streetAddress": "41 Duke",
    "city": "MYCity",
    "state": "MA",
    "zip": "02360"
}'
```

##### GET constituents 
- list constituents with pagination as to not overload the database
```
curl --location 'http://localhost:8080/v0/constituents?offset=0&limit=100'
```

##### POST export task 
- asynchronous task to start an csv export. The process of creating a csv could take some time as the database grows, so this kicks of the process and returns 202 and an export ID that can be polled.
```
curl --location --request POST 'http://localhost:8080/v0/constituents/exportTasks' \
--header 'Content-Type: application/json' \
--data '{
"startTimeMs": 0,
"endTimeMs": 1710267734095
}'
```

##### GET export task status 
- tells you if the export is complete or not
```
curl --location 'http://localhost:8080/v0/constituents/exportTasks/115dc2ba-c955-457b-b64d-b707375b4f1b/status'
```

##### GET export 
- to retrieve results if export is complete
```
curl --location 'http://localhost:8080/v0/constituents/exportTasks/115dc2ba-c955-457b-b64d-b707375b4f1b'
```


