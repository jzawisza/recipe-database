import argparse
import csv
import getpass
import mysql.connector
import re
from datetime import datetime
from mysql.connector import errorcode

DATABASE_NAME = 'jz_recipes'
TYPES_TO_CONVERT_TO_TAGS = ['Breakfast', 'Dessert', 'Drink']
DB_DUMP_CSV = 'recipe_database_dump.csv'
TAG_NAME_FILE = 'tags.txt'
RECIPE_TAG_MAPPING_CSV = 'tag_mapping.csv'

parser = argparse.ArgumentParser()
parser.add_argument('-s', '--server', help='Machine where the database server is located: defaults to localhost', default='localhost')
parser.add_argument('-u', '--username', help='Username for connecting to the database', required=True)
parser.add_argument('-p', '--password', help='Prompt for the password to connect to the database', action='store_true')

args = parser.parse_args()

db_password = ''
if args.password:
    db_password = getpass.getpass()

try:
    cnx = mysql.connector.connect(user=args.username, password=db_password, host=args.server, database=DATABASE_NAME)
    cursor = cnx.cursor()

    query = 'select source, title, ingredients, preparation, notes, serves, calories_per_serving, type from recipes AS r, recipe_types AS rt WHERE r.tid = rt.tid'

    cursor.execute(query)

    with open(DB_DUMP_CSV, 'w', newline='') as dump_csv, open(TAG_NAME_FILE, 'w') as tag_file, open(RECIPE_TAG_MAPPING_CSV, 'w', newline='') as mapping_csv:
        dump_writer = csv.writer(dump_csv)
        mapping_writer = csv.writer(mapping_csv)
        tag_types_found = set()
        magazine_date_regex = r"(January|February|March|April|May|June|July|August|September|October|November|December)\s\d+"

        for (source, title, ingredients, preparation, notes, serves, calories_per_serving, recipe_type) in cursor:
            # Check source for magazine with date included: if there is a date, use that for the creation and modification dates
            # so that searching by those dates makes sense in the application.
            # If there's no date, use the current date for those values
            creationTime = datetime.now()
            magazineDateObj = re.search(magazine_date_regex, source)
            if magazineDateObj is not None:
                magazineDateStr = magazineDateObj.group(0)
                try:
                    creationTime = datetime.strptime(magazineDateStr, '%B %Y')
                except ValueError:
                    print(f'Could not parse magazine date {magazineDateStr} for recipe {title}')
            modifiedTime = creationTime

            output_fields = [ source, title, ingredients, preparation, notes, serves, calories_per_serving, creationTime, modifiedTime ]
            dump_writer.writerow(output_fields)
            if recipe_type in TYPES_TO_CONVERT_TO_TAGS:
                tag_types_found.add(recipe_type)
                mapping_writer.writerow([ title, recipe_type])

        dump_csv.close()
        mapping_csv.close()

        # Write all tags that we found into a text file
        for tag in tag_types_found:
            print(tag, file=tag_file)
        tag_file.close()

    cursor.close()
except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print('Username or password not valid')
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
        print(f'Database ${DATABASE_NAME} does not exist')
    else:
        print(err)
else:
    cnx.close()