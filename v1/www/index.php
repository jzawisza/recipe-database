<?php
require("header.php");

$con = mysql_connect("localhost","FILL_IN_USERNAME","FILL_IN_PASSWORD");
if (!$con) {
  die('Could not connect: ' . mysql_error());
}

mysql_select_db("jz_recipes",$con);

// Get all recipes
$result = mysql_query("SELECT id, type FROM recipes, recipe_types WHERE recipes.tid = recipe_types.tid") or die("Could not get recipes: " . mysql_error());

$num_recipes = mysql_num_rows($result);
?>

<h2>Welcome to Recipe Database 1.0</h2>

<p>&nbsp;There
<?php
// Print out the number of recipes
if($num_recipes == 1) {
  echo "is 1 recipe ";
}
else {
  echo "are " . (int)$num_recipes . " recipes ";
}
?>

in the database.</p>

<p>&nbsp;
<a href="list_recipes.php">List all recipes</a>
</p>

<hr/>
<h3>Categories</h3>

<?php
// Go through the list of recipes and count which ones are in each category
while($row = mysql_fetch_array($result)) {
  $old_count = (int)$type_count[$row['type']];
  $type_count[$row['type']] = ++$old_count;
}

mysql_free_result($result);

// Now get the list of all categories from the server, and print them out,
// along with the number of recipes in each category
$result = mysql_query("SELECT tid, type FROM recipe_types ORDER BY type") or die("Could not get recipe categories: " . mysql_error());

?>

<ul>
<?php
$i = 0;
while($row = mysql_fetch_array($result)) {
  $categories[$i] = $row['type'];
  $category_ids[$i] = $row['tid'];
  echo "<li><a href=\"list_recipes.php?category=". $row['tid'] . "\"><i>" . $row['type'] . " (" . (int)$type_count[$row['type']] . ")</i></a></li>\n";
  $i++;
}

$num_cats = $i;
mysql_free_result($result);
?>

</ul>
<hr/>

<h3>Search</h3>
<form name="searchForm" action="list_recipes.php" method="POST">
<p>
&nbsp;Find all recipes in category

<select name="searchCategory">
<option value="-1">All</option>

<?php
for($i = 0; $i < $num_cats; $i++) {
  echo "<option value=\"" . $category_ids[$i];
  echo "\">" . $categories[$i] . "</option>\n";
}
?>

</select>
where the

<select name="textField">
<option value="title">title</option>
<option value="source">source</option>
<option value="ingredients">ingredients</option>
<option value="preparation">preparation</option>
<option value="notes">notes</option>
</select>
text field

<select name="queryType">
<option value="contains">contains</option>
<option value="is">is</option>
</select>

<input type="text" name="searchText" size="40"></input>
</p>

<p>
<input type="submit" value="Search"></input>
</p>

</form>

<?php
mysql_close($con);

require("footer.php");

?>
