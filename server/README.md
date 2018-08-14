# Server Setup

## Database Setup

The server uses [PostgreSQL](https://www.postgresql.org/) as its database backend, so you must install that first.  Once PostgreSQL is installed, run the following commands to set up the database:

```
psql -U postgres -c 'CREATE DATABASE "RECIPEDB";'
psql -U postgres -d RECIPEDB -f ./db/schema.sql
```

### Setting the Server Connection Properties

In the `server` directory, create a file named `.env` with the following contents, modifying the values as necessary:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=<your_password_here>
```

## Running the Server

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.  Node 8 or higher is required.
2. Install your dependencies

    ```
    cd path/to/recipedb; npm install
    ```

3. Start your app

    ```
    npm start
    ```

## Testing

Simply run `npm test` and all your tests in the `test/` directory will be run.