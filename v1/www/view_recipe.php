<?php
$print_view = filter_input(INPUT_GET,"printer_friendly",FILTER_VALIDATE_INT);
if(!$print_view and $_GET['printer_friendly']) {
  die("<p>Error validating printer_friendly setting!</p>\n");
}

if(!$print_view) {
  require("header.php");
}

$con = mysql_connect("localhost","FILL_IN_USERNAME","FILL_IN_PASSWORD");
if (!$con) {
  die('Could not connect: ' . mysql_error());
}

mysql_select_db("jz_recipes",$con);

if($_GET['id']) {
  $id = filter_input(INPUT_GET,"id",FILTER_VALIDATE_INT);
  if(!$id) {
    die("<p>Error validating recipe ID!</p>\n");
  }

  $query = "SELECT title, source, ingredients, preparation, notes FROM recipes WHERE id = " . $id;
  $result = mysql_query($query) or die ("Could not look up recipe: " . mysql_error());
  $row = mysql_fetch_array($result);

  if(!$print_view) {
    echo "<h3>" . $row['title'] . "</h3>\n\n";
  }
  else {
    echo "<p><b>" . strtoupper($row['title']) . "</b></p>\n\n";
  }

  echo "<p><b>Source:</b> " . $row['source'] . "</p>\n";

  echo "<p><b>Ingredients</b><br/>\n";
  echo nl2br($row['ingredients']) . "</p>\n";

  echo "<p><b>Preparation</b><br/>\n";
  echo nl2br($row['preparation']) . "</p>\n";

  echo "<p><b>Notes</b><br/>\n";
  echo nl2br($row['notes']) . "</p>\n\n";

  if(!$print_view) {
    echo "<table border=\"0\">\n";
    echo "<tr>\n<td>\n";
    echo "<form name=\"printViewForm\" action=\"view_recipe.php\" method=\"GET\">\n";
    echo "<input type=\"submit\" value=\"Print View\"></input>\n";
    echo "<input type=\"hidden\" name=\"id\" value=\"" . $id . "\"></input>\n";
    echo "<input type=\"hidden\" name=\"printer_friendly\" value=\"1\"></input>\n";
    echo "</form>\n</td>\n\n";

    echo "<td>\n<form name=\"updateForm\" action=\"add_recipe.php\" method=\"POST\">\n";
    echo "<input type=\"submit\" value=\"Update Recipe\"></input>\n";
    echo "<input type=\"hidden\" name=\"id\" value=\"" . $id . "\"></input>\n";
    echo "</form>\n</td>\n\n";

    echo "</table>\n\n";
  }

  mysql_free_result($result);
}

mysql_close($con);

if(!$print_view) {
  require("footer.php");
}
?>
