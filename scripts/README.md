# Migration Scripts

The scripts in this directory are for exporting the MySQL database data from version 1 of this application into a format that can be read by the PostgreSQL database used by version 2.

Note that these scripts require Python version 3.6 or higher.

## Dumping The MySQL Data
On the server where the version 1 MySQL database is located, run the initial migration script:

    python3 dump_mysql_data.py -u <USERNAME> [-s <DB_SERVER] [-p]

The script takes the following parameters.
* `-s`:  The server where the database is running (defaults to `localhost`)
* `-u`: Username to connect to the database as
* `-p`: Prompt the user for the password to connect to the database

After the script runs, three files will be created in the directory where it ran:

* `recipe_database_dump.csv`: CSV file to import into PostgreSQL
* `tag_mapping.csv`: Mapping of recipe titles to tags
* `tags.txt`: List of tags to add to the database

These files will serve as input to the following steps.

## Importing The MySQL Data Dump Into PostgreSQL
Use a command similar to the following to import the MySQL data into PostgreSQL:

    psql -U postgres -d RECIPEDB -c "COPY recipes(source, title, ingredients, preparation, notes, serves, calories_per_serving, creation_time, modified_time) FROM '/path/to/recipe_database_dump.csv' CSV;"

## Post-Processing The Data Dump
After importing the data into PostgreSQL, run the following scripts to add tag and recipe link information to the data.

These scripts can overwrite existing data, so make sure you run them **immediately after the data is first imported**.

Note that each script takes the same `-s`, `-u`, and `-p` parameters as described above.

### Add Tag Information
     python3 insert_tags.py -u postgres -p -t /path/to/tags.txt -m /path/to/tag_mapping.csv