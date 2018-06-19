# Dummy Data API
Simple server exposing *dummy* data to build a sample app.

## Usage
Simply run

    npm install
    npm start

and access ``http://127.0.0.1:3000/data`` to get an array of data.

If you want to retrieve just a subset, specify the lower and upper limit as query parameters, for example:

    http://127.0.0.1:3000/data?_start=8&_end=12
