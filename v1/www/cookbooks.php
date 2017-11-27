<?php
require("header.php");

$con = mysql_connect("localhost","FILL_IN_USERNAME","FILL_IN_PASSWORD");
if (!$con) {
  die('Could not connect: ' . mysql_error());
}

mysql_select_db("jz_recipes",$con);

// We can call this page in one of 4 ways:
//
// 1) Just displaying information
// 2) Resubmitted after adding cookbook recipe
// 3) Resubmitted after adding cookbook
// 4) Resubmitted after deleting cookbook
//
// In the latter 3 cases, we'll redisplay the page after printing a
// confirmation message.

// Case 2
if($_POST['title']) {
  $cid = filter_input(INPUT_POST,"cid",FILTER_VALIDATE_INT);
  $pagenum = filter_input(INPUT_POST,"pagenum",FILTER_VALIDATE_INT);
  $title = filter_input(INPUT_POST,"title",FILTER_SANITIZE_STRING);
  // No need to filter a checkbox
  if($_POST['has_tried'] == "on") {
    $has_tried = 1;
  }
  else {
    $has_tried = 0;
  }

  if(!$cid) {
    die("<p>Error filtering cookbook name ID!</p>\n");
  }
  if(!$pagenum) {
    die("<p>Error filtering page number!</p>\n");
  }
  if(!$title) {
    die("<p>Error filtering recipe title!</p>\n");
  }

  $query = sprintf("INSERT INTO cookbook_recipes (cid, page_num, has_tried, title) VALUES(%d, %d, %d, '%s')",
		   $cid,
		   $pagenum,
		   $has_tried,
		   mysql_real_escape_string($title));

  $result = mysql_query($query);

  if(!$result) {
    die('Could not add recipe to database: ' . mysql_error());
  }
  else {
    echo "<p>&nbsp;Recipe added successfully!</p>\n";
  }

  mysql_free_result($result);

  // Unset the variables just to be on the safe side
  unset($cid);
  unset($pagenum);
  unset($has_tried);
  unset($title);
}
// Case 3
else if($_POST['cid_to_delete']) {
  $cid = filter_input(INPUT_POST,"cid_to_delete",FILTER_VALIDATE_INT);

  $query = "DELETE FROM cookbook_recipes WHERE cid = " . $cid;
  $result = mysql_query($query);
  if(!$result) {
    die('Could not delete recipes from cookbook: ' . mysql_error());
  }

  $query = "DELETE FROM cookbooks WHERE cid = " . $cid;
  $result = mysql_query($query);
  if(!$result) {
    die('Could not delete cookbook: ' . mysql_error());
  }

  echo "<p>&nbsp;Cookbook successfully deleted!</p>\n";

  mysql_free_result($result);

  // Unset the variables just to be on the safe side
  unset($cid);
}
// Case 4
else if($_POST['new_title']) {
  $title = filter_input(INPUT_POST,"new_title",FILTER_SANITIZE_STRING);

  $query = "INSERT INTO cookbooks (name) VALUES('" . $title . "')";
  $result = mysql_query($query);
  if(!$result) {
    die('Could not delete cookbook: ' . mysql_error());
  }
  else {
    echo "<p>&nbsp;Cookbook added successfully!</p>\n";
  }

  mysql_free_result($result);

  // Unset the variables just to be on the safe side
  unset($title);
}

// Get all recipes
$result = mysql_query("SELECT id, name FROM cookbook_recipes, cookbooks WHERE cookbook_recipes.cid = cookbooks.cid") or die("Could not get cookbook recipes: " . mysql_error());

$num_recipes = mysql_num_rows($result);
?>

<script type="text/javascript">
function validate_required(field,alerttxt) {
  with (field)
  {
    if (value==null||value=="") {
      alert(alerttxt);
      return false;
					  	}
    else {
      return true;
    }
  }
}

function check_input(thisform) {
  with (thisform) {
    if(validate_required(pagenum,"You must specify a page number.")==false) {
      pagenum.focus();
      return false;
    }
    else if(validate_required(title,"You must specify a recipe title.")==false) {
      title.focus();
      return false;
    }
  }

  return true;
}

// Taken from list_recipes.php: confirm cookbook deletion
function confirmDelete() {
  confirm("This cookbook and all the recipes from it will be permanently deleted from the database.  Do you want to proceed?");
}

function check_cookbook_input(thisform) {
  with (thisform) {
    if(validate_required(new_title,"You must specify a recipe title.")==false) {
      new_title.focus();
      return false;
    }
  }

  return true;
}
</script>

<p>&nbsp;There
<?php
// Print out the number of recipes
if($num_recipes == 1) {
  echo "is 1 cookbook recipe ";
}
else {
  echo "are " . (int)$num_recipes . " cookbook recipes ";
}
?>

in the database.</p>

<p>&nbsp;
<a href="list_cookbook_recipes.php">List all cookbook recipes</a>
</p>

<hr/>

<h3>Categories</h3>

<?php
// Go through the list of cookbook recipes and count which ones are from each
// cookbook
while($row = mysql_fetch_array($result)) {
  $old_count = (int)$type_count[$row['name']];
  $type_count[$row['name']] = ++$old_count;
}

mysql_free_result($result);

// Now get the list of all cookbooks from the server, and print them out,
// along with the number of recipes from each cookbook
$result = mysql_query("SELECT cid, name FROM cookbooks ORDER BY name") or die("Could not get cookbooks: " . mysql_error());
?>

<ul>
<?php
$i = 0;
while($row = mysql_fetch_array($result)) {
  $cookbooks[$i] = $row['name'];
  $cookbook_ids[$i] = $row['cid'];
  echo "<li><a href=\"list_cookbook_recipes.php?cookbook=". $row['cid'] . "\"><i>" . $row['name'] . " (" . (int)$type_count[$row['name']] . ")</i></a></li>\n";
  $i++;
}

$num_cats = $i;
mysql_free_result($result);
?>

</ul>
<hr/>

<h3>Add Cookbook Recipe</h3>

<form action="cookbooks.php" onsubmit="return check_input(this)" method="post">
<table border="0" width="50%">

<tr>
<td class="recipe">
Cookbook
</td>
<td>
<select name="cid">

<?php
for($i = 0; $i < $num_cats; $i++) {
  echo "<option value=\"" . $cookbook_ids[$i];
  echo "\">" . $cookbooks[$i] . "</option>\n";
}
?>

</select>
</tr>

<tr>
</td>
<td class="recipe">
Page Number
</td>
<td>
<input type="text" name="pagenum" size="4"/>
</td>
</tr>

<tr>
<td class="recipe" colspan="2">
<input type="checkbox" name="has_tried" checked/>&nbsp;I have made this recipe before
</td>
</tr>

<tr>
<td class="recipe">
Title
</td>
<td>
<input type="text" name="title" size="75"/>
</td>
</tr>

<tr>
<td>
<input type="submit" value="Add Cookbook Recipe">
</td>
</tr>

</table>
</form>

<hr/>

<h3>Search</h3>
<form name="searchCookbookForm" action="list_cookbook_recipes.php" method="POST">

<p>
&nbsp;Find recipes from cookbook

<select name="searchCookbook">
<option value="-1">All</option>

<?php
for($i = 0; $i < $num_cats; $i++) {
  echo "<option value=\"" . $cookbook_ids[$i];
  echo "\">" . $cookbooks[$i] . "</option>\n";
}
?>

</select>

where the title

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

<hr/>

<h3>Add Cookbook</h3>

<form action="cookbooks.php" onsubmit="return check_cookbook_input(this)" method="post">
<table border="0" width="50%">

<tr>
<td class="recipe">
Title
</td>
<td>
<input type="text" name="new_title" size="75"/>
</td>
</tr>

<tr>
<td>
<input type="submit" value="Add Cookbook">
</td>
</tr>

</table>
</form>

<hr/>

<h3>Delete Cookbook</h3>

<form action="cookbooks.php" method="post">

<select name="cid_to_delete">

<?php
for($i = 0; $i < $num_cats; $i++) {
  echo "<option value=\"" . $cookbook_ids[$i];
  echo "\">" . $cookbooks[$i] . "</option>\n";
}
?>

</select>

<input type="submit" value="Delete" onclick="confirmDelete()"></input>

</form>

<hr/>

<?php
mysql_close($con);

require("footer.php");

?>
