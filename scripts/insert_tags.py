import argparse
import csv
import getpass
import json
import psycopg2

RECIPE_DB_NAME = 'RECIPEDB'

# Take a cursor object and return the first argument of the first row returned,
# or None if there is no such argument
def get_single_arg_from_cursor(cursor):
    row = cursor.fetchone()
    if row is not None:
        return row[0]
    return None

# Given a tag name and ID, build JSON of the format
# {"tags": [{"id": "tag_id", "name": "tag_name"}]}
def build_tag_json(tag_name, tag_id):
    tag_json = {}
    id_name_json = {}
    id_name_json['id'] = tag_id
    id_name_json['name'] = tag_name
    tag_json['tags'] = [id_name_json]
    return json.dumps(tag_json)



parser = argparse.ArgumentParser()
parser.add_argument('-s', '--server', help='Machine where the database server is located: defaults to localhost', default='localhost')
parser.add_argument('-u', '--username', help='Username for connecting to the database', required=True)
parser.add_argument('-p', '--password', help='Prompt for the password to connect to the database', action='store_true')
parser.add_argument('--port', help='Port to use for connection: default to 5432', default='5432')
parser.add_argument('-t', '--tagfile', help='Text file containing the new tags to create', required=True)
parser.add_argument('-m', '--mappingfile', help='CSV file mapping from recipe titles to tags', required=True)

args = parser.parse_args()

db_password = None
if args.password:
    db_password = getpass.getpass()

connection = None
try:
    connection  = psycopg2.connect(user = args.username,
                                   password = db_password,
                                   host = args.server,
                                   port = args.port,
                                   dbname = RECIPE_DB_NAME)

    cursor = connection.cursor()

    with open(args.tagfile, 'r') as tag_file, open(args.mappingfile, 'r', newline='') as mapping_csv:
        # Map tags to database IDs
        tag_id_dict = {}
        for tag in tag_file:
            tag_name = tag.rstrip()
            # See if tag is already in the database, and add it if not
            cursor.execute("SELECT id FROM tags WHERE name = %s", (tag_name,))
            tag_id = get_single_arg_from_cursor(cursor)
            if tag_id is None:
                cursor.execute("INSERT INTO tags (name) VALUES(%s) RETURNING id", (tag_name,))
                tag_id = get_single_arg_from_cursor(cursor)
                if tag_id is None:
                    raise RuntimeError(f'Null ID returned when attempting to insert tag {tag_name}')
            tag_id_dict[tag_name] = tag_id

        tag_file.close()

        # Now that we have database IDs for the tags, add the tags to the recipes
        mapping_reader = csv.reader(mapping_csv)
        for row in mapping_reader:
            recipe_name = row[0]
            recipe_tag = row[1]
            recipe_tag_id = tag_id_dict[recipe_tag]
            if recipe_tag_id is not None:
                # This code assumes that recipes have no existing tags, and therefore
                # it's safe to overwrite the recipe data
                tag_json = build_tag_json(recipe_tag, recipe_tag_id)

                # Titles are guaranteed to be unique by database constraints
                cursor.execute("SELECT ID FROM recipes WHERE title = %s", (recipe_name,))
                recipe_id = get_single_arg_from_cursor(cursor)
                if recipe_id is not None:
                    cursor.execute("UPDATE recipes SET data = %s WHERE id = %s", (tag_json, recipe_id))
                else:
                    print(f'Could not find recipe {recipe_name} in database, skipping')
            else:
                print(f'Tag name {recipe_tag} for recipe {recipe_name} is not in tag file {args.tagfile}, skipping')

        connection.commit()
except (Exception, psycopg2.Error) as error :
    print ("Error:", error)
finally:
    if(connection):
        cursor.close()
        connection.close()