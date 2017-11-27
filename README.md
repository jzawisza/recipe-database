# recipe-database
A trivial application I wrote quite a while ago to play around with PHP and MySQL.  It's proven useful for keeping track of our recipes, so I've kept it around.  Eventually, I'll rewrite it as a modern web application.

# Setup
First, you'll need to set up a LAMP server somewhere.  Note that this application uses a deprecated MySQL connection API, so **only PHP 5.4 or older is supported.**

Create a user for the application by logging in to MySQL as `root` and issuing the following commands, replacing `myuser` and `mypassword` with your own credentials.
```
CREATE DATABASE jz_recipes;
GRANT ALL PRIVILEGES ON jz_recipes.* TO 'myuser'@'localhost' IDENTIFIED BY 'mypassword';
```

After the database is created, load the initial schema, using the `db/schema.sql` file.
```
mysql -u root -p jz_recipes < schema.sql
```

To deploy the application, simply copy all the files in the `www` directory to the relevant directory on your server, i.e. the Apache `DocumentRoot` or a subdirectory thereof.  Note that most of the PHP files have the following line near the top:
```
$con = mysql_connect("localhost","FILL_IN_USERNAME","FILL_IN_PASSWORD");
```
You'll need to replace `FILL_IN_USERNAME` and `FILL_IN_PASSWORD` with the real username and password before deployment.
