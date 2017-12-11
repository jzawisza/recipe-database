# Adds a recipe to the recipe database.
# Only Cooking Light recipes are suppported at this time.

from pyquery import PyQuery as pq
import getopt
import mysql.connector
import sys
import urllib

def usage():
    print "Usage: ", sys.argv[0], "[--user <username>] [--password <password>] [--database <db>]"
    print "--url <recipe_urL> --type <recipe_type> [--made-before] [--help]"
    print '''
    -u, --user\tUsername used when connecting to the database
    -p, --password\tPassword used when connecting to the database
    -d, --database\tDatabase to connect to (default is jz_recipes)
    -r, --url\tURL for the recipe
    -t, --type\tThe type of recipe
    -m, --made-before\tIndicate that the recipe has been made before
    -h, --help\tDisplay this message
    '''

try:
    opts, args = getopt.getopt(sys.argv[1:], "u:p:d:r:t:mh", ["user=", "password=", "database=", "url=", "type=", "made-before", "help"])
except getopt.GetoptError as err:
    print(err)
    usage()
    sys.exit(1)

user = None
password = None
db = 'jz_recipes'
recipe_url = None
recipe_type = None
made_before = False

for o, a in opts:
    if o in ("-u", "--user"):
        user = a
    elif o in ("-p", "--password"):
        password = a
    elif o in ("-d", "--database"):
        db = a
    elif o in ("-r", "--url"):
        recipe_url = a
    elif o in ("-t", "--type"):
        recipe_type = a
    elif o in ("-m", "--made-before"):
        made_before = True
    elif o in ("-h", "--help"):
        usage()
        sys.exit(1)

# Verify command line options
if(recipe_url is None):
    print "--url option not specified"
    usage()
    sys.exit(1)
if(recipe_type is None):
    print "--type option not specified"
    usage()
    sys.exit(1)

try:
  cnx = mysql.connector.connect(user=user, password=password, database=db)
except mysql.connector.Error as err:
    print(err)
    sys.exit(1)

# Look up the specified recipe type to make sure it's valid
type_id = None
type_id_query = "SELECT tid FROM recipe_types WHERE type=%s"
cursor = cnx.cursor()
try:
    cursor.execute(type_id_query, (recipe_type, ))
    row = cursor.fetchone()
    if(cursor.rowcount > 0):
        type_id = row[0]
    else:
        print "Invalid recipe type", recipe_type, "specified"
        sys.exit(1)
except mysql.connector.Error as err:
    print(err)
    cursor.close()
    cnx.close()
    sys.exit(1)
if(type_id is None):
    print "Error fetching recipe type ID from database"
    cursor.close()
    cnx.close()
    sys.exit(1)

# TODO: parse recipe URL, insert into database
d = pq(url=recipe_url)
p = d("script[type='application/ld+json']")
recipe_json = p.text()
print recipe_json

cursor.close()
cnx.close()
