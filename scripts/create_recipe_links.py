import argparse
import csv
import getpass
import json
import psycopg2
from progress.bar import IncrementalBar

# Add a message to the list of messages passed in,
# but only if verbose mode is enabled
def add_message(msg, msgList, verbose):
    if verbose:
        msgList.append(msg)

RECIPE_DB_NAME = 'RECIPEDB'

parser = argparse.ArgumentParser()
parser.add_argument('-s', '--server', help='Machine where the database server is located: defaults to localhost', default='localhost')
parser.add_argument('-u', '--username', help='Username for connecting to the database', required=True)
parser.add_argument('-p', '--password', help='Prompt for the password to connect to the database', action='store_true')
parser.add_argument('--port', help='Port to use for connection: default to 5432', default='5432')
parser.add_argument('-d', '--dry-run', help='Run the script without writing anything to the database', action='store_true')
parser.add_argument('-v', '--verbose', help='Run in verbose mode', action='store_true')

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

    # Create dictionary mapping recipe titles to names
    title_id_dict = {}
    cursor.execute("SELECT title, id FROM recipes")
    for recipe in cursor:
        recipe_name = recipe[0]
        recipe_id = recipe[1]
        title_id_dict[recipe_name] = recipe_id

    with IncrementalBar('Generating recipe links', max = len(title_id_dict)) as bar:
        bidi_link_dict = {}
        messages = []
        for title, id in title_id_dict.items():
            cursor2 = connection.cursor()
            # Search for any recipes that include the exact title of another recipe anywhere in their text,
            # filtering so we don't link a recipe to itself
            cursor.execute('SELECT title, id FROM recipes WHERE document_vector @@ phraseto_tsquery(%s) AND id != %s', (title, id))
            for linked_recipe in cursor:
                linked_name = linked_recipe[0]
                linked_id = linked_recipe[1]
                if bidi_link_dict.get(id) is not None:
                    add_message(f'Omitting link {title} -> {linked_name}: link already exists in other direction', messages, args.verbose)
                else:
                    add_message(f'Found link: {title} -> {linked_name} ({id} -> {linked_id})', messages, args.verbose)

                    if not args.dry_run:                        
                        cursor2.execute('INSERT INTO recipe_links (source_id, dest_id) VALUES(%s, %s)', (id, linked_id))

                    bidi_link_dict[linked_id] = id
            bar.next()
        cursor2.close()

    # This only prints messages if verbose mode is on, since the add_message
    # function won't add messages to the message list if verbose mode is off
    for msg in messages:
        print(msg)
    
    connection.commit()
except (Exception, psycopg2.Error) as error :
    print ("Error:", error)
finally:
    if(connection):
        cursor.close()
        connection.close()