# Extract Serves and Calories/Serving information from the notes field in the database,
# and puts it into the new first-class fields for those items.

import getopt
import mysql.connector
import re
import sys

def usage():
    print "Usage: ", sys.argv[0], "[--user] [--password] [--database] [--dry-run] [--verbose] [--help]"
    print '''
    -u, --user\tUsername used when connecting to the database
    -p, --password\tPassword used when connecting to the database
    -d, --database\tDatabase to connect to (default is jz_recipes)
    -r, --dry-run\tShow what changes would be made without actually making those changes
    -v, --verbose\tVerbose mode
    -h, --help\tDisplay this message
    '''

try:
    opts, args = getopt.getopt(sys.argv[1:], "u:p:d:rvh", ["user=", "password=", "database=", "dry-run", "--verbose", "help"])
except getopt.GetoptError as err:
    print(err)
    usage()
    sys.exit(1)

user = None
password = None
db = 'jz_recipes'
dry_run = False
verbose = False

for o, a in opts:
    if o in ("-u", "--user"):
        user = a
    elif o in ("-p", "--password"):
        password = a
    elif o in ("-d", "--database"):
        db = a
    elif o in ("-r", "--dry-run"):
        dry_run = True
        print "Doing dry run, database will not be updated"
    elif o in ("-v", "--verbose"):
        verbose = True
    elif o in ("-h", "--help"):
        usage()
        sys.exit(1)

if(verbose):
    print "Connecting to database", db, "with username", user, "and password" , password

try:
  cnx = mysql.connector.connect(user=user, password=password, database=db)
except mysql.connector.Error as err:
    print(err)
    sys.exit(1)

notes_query = "SELECT id, title, notes FROM recipes"
cursor = cnx.cursor(buffered=True)
cursor_update = cnx.cursor()
try:
    cursor.execute(notes_query)
except MySQLdb.Error,e:
    print e[0], e[1]
    cursor_update.close()
    cursor_close()
    cnx.close()
    sys.exit(1)

for (id, title, note) in cursor:
    serves = None
    calories = None

    # Rewrite note to omit Serves and Calories/Serving lines after extracting those values
    new_note = ''
    for line in note.splitlines():
        include_line = True
        servesObj = re.search(r'Serves (\d+)', line)
        if(servesObj):
            serves = servesObj.group(1)
            include_line = False
        else:
            yieldsObj = re.search(r'[Y|y]ield.\s+(\d+)', line)
            if(yieldsObj):
                serves = yieldsObj.group(1)
                include_line = False
            else:
                makesObj = re.search(r'Makes (\d+)', line)
                if(makesObj):
                    serves = makesObj.group(1)
                    include_line = False

        caloriesObj = re.search(r'(\d+) calories', line)
        if(caloriesObj):
            calories = caloriesObj.group(1)
            include_line = False

        if line.rstrip() and include_line:
            new_note += line
            new_note += '\n'

    # Remove trailing newline
    new_note = new_note.rstrip()

    new_note = new_note.encode('ascii', 'replace')

    if(verbose):
        print "-------"
        print "ID =",id
        print "Title=",title.encode('ascii', 'replace')
        print "Old note =", note.encode('ascii', 'replace')
        print "New note =", new_note

    # Don't do an update unless something has changed
    if(serves or calories):
        update_query = "UPDATE recipes SET notes = %(notes)s"
        update_data = {
            'notes': new_note
        }
        if(serves):
            update_query += ", serves = %(serves)s"
            update_data['serves'] = serves
        if(calories):
            update_query += ", calories_per_serving = %(calories)s"
            update_data['calories'] = calories

        update_query += " WHERE id = %(id)s"
        update_data['id'] = id

        if(dry_run):
            print "DRY-RUN:", (update_query % update_data)
        else:
            try:
                cursor_update.execute(update_query, update_data)
            except MySQLdb.Error,e:
                print e[0], e[1]
                cnx.rollback()
                cursor_update.close()
                cursor_close()
                cnx.close()
                sys.exit(1)
            if(verbose):
                print "Update row count =", cursor.rowcount
    elif(verbose):
        print "No update required for %s (ID %d)" % (title.encode('ascii', 'replace'), id)


cnx.commit()
cursor_update.close()
cursor.close()
cnx.close()
