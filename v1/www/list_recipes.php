<?php
require("header.php");

$con = mysql_connect("localhost","FILL_IN_USERNAME","FILL_IN_PASSWORD");
if (!$con) {
  die('Could not connect: ' . mysql_error());
}    

mysql_select_db("jz_recipes",$con);

// There are 4 ways of calling this page:
// 1) With no parameters (show all)
// 2) With a GET or POST 'category' parameter (show all from a particular
//    category)
// 3) With POST search query parameters (show all that match the specified
//    criteria)
// 4) With POST delete IDs (delete recipes)
//
// Depending on which way we used, we need to add some restrictions to the SQL
// query that gets the recipe list (except for Case 1).
//
// If Case 4 is used, we should redisplay the page to reflect the deletion
// results (if the query was successful).

// Case 4
if($_POST['recipes_to_delete'] && sizeof($_POST['recipes_to_delete']) > 0) {
  $query = "DELETE FROM recipes WHERE (";

  foreach ($_POST['recipes_to_delete'] as $rid) {
    $query .= "id = $rid OR ";
  }

  // Add a trailing query that's guaranteed to fail so the last statement is
  // trivially true
  $query .= "id = 0)";

  mysql_query($query) or die("Could not delete recipes: " . mysql_error());
}

$query = "SELECT id, title, has_tried FROM recipes";

// Case 3
if($_POST['searchText']) {
  // Validate the search query data
  $cat_id = filter_input(INPUT_POST,"searchCategory",FILTER_VALIDATE_INT);
  $field = filter_input(INPUT_POST,"textField",FILTER_SANITIZE_STRING);
  $query_type = filter_input(INPUT_POST,"queryType",FILTER_SANITIZE_STRING);
  $text = filter_input(INPUT_POST,"searchText",FILTER_SANITIZE_STRING);

  if(!$cat_id) {
    die("<p>Error validating search category!</p>\n");
  }
  if(!$field) {
    die("<p>Error validating search text field!</p>\n");
  }
  if(!$query_type) {
    die("<p>Error validating search type!</p>\n");
  }
  if(!$text) {
    die("<p>Error validating search string!</p>\n");
  }

  if($cat_id != -1) {
    $query .= " WHERE tid = $cat_id AND ";
  }
  else {
    $query .= " WHERE ";
  }

  $query .= "$field LIKE ";

  if($query_type == "contains") {
    $query .= "\"%" . $text . "%\"";
  }
  else {
    $query .= "\"" . $text . "\"";
  }
}
// Case 2
else if($_GET['category']) {
  $type = filter_input(INPUT_GET,"category",FILTER_VALIDATE_INT);
  if(!$type) {
    die("<p>Error filtering category!</p>\n");
  }

  $query .= " WHERE tid = ";
  $query .= $type;
}
else if($_POST['category']) {
  // Since INPUT_REQUEST isn't implemented yet, we need two else if statements
  // for this case.  The categry information can come from index.php via GET,
  // or from a delete operation from this page via POST.
  $type = filter_input(INPUT_POST,"category",FILTER_VALIDATE_INT);
  if(!$type) {
    die("<p>Error filtering category!</p>\n");
  }

  $query .= " WHERE tid = ";
  $query .= $type;
}

// 2008-11-03: sort recipes by title
$query .= " ORDER BY title";

$result = mysql_query($query) or die("Could not get list of recipes: " . mysql_error());

$num_rows = mysql_num_rows($result);
echo "\n<p>&nbsp;$num_rows ";
if($num_rows == 1) {
  echo "recipe ";
}
else {
  echo "recipes ";
}
echo "found.</p>\n\n";

// Javascript for showing/hiding recipes, confirming deletion, and checking/
// unchecking all checkboxes
echo <<<END
<script type="text/javascript">
function setTriedElements(status) {
  trs = document.getElementsByTagName('tr');
  for(i=0; i < trs.length; i++) {
    if(trs[i].className == "tried") {
      trs[i].style.display = status;
    }
  }
}

function setNotTriedElements(status) {
  trs = document.getElementsByTagName('tr');
  for(i=0; i < trs.length; i++) {
    if(trs[i].className == "not_tried") {
      trs[i].style.display = status;
    }
  }
}

// Control which recipes are shown/hidden
function showHideRecipes() {
  if(document.recipeForm.hasTriedCheckbox.checked) {
    showHasTried = document.recipeForm.hasTried.value;
    if(showHasTried == "1") {
      // We only want to see recipes we've tried before
      setTriedElements('table-row');
      setNotTriedElements('none');
    }
    else {
      // We only want to see recipes we haven't tried before
      setTriedElements('none');
      setNotTriedElements('table-row');
    }
  }
  else {
    // We're unchecking the checkbox; show all
    setTriedElements('table-row');
    setNotTriedElements('table-row');
  }
}

// Confirm recipe deletion
function confirmDelete() {
  confirm("These recipes will be permanently deleted.  Do you want to proceed?");
}

// Check/uncheck all recipe boxes
function checkBoxes() {
  if(document.recipeForm.selector.checked==true) {
    chk=document.recipeForm.elements;

    for (i = 0; i < chk.length; i++)
      if(chk[i].name == "recipes_to_delete[]") {
	chk[i].checked = true ;
      }
  }
  else {
    for (i = 0; i < chk.length; i++)
      if(chk[i].name == "recipes_to_delete[]") {
	chk[i].checked = false ;
      }
  }
}
</script>

END;

// Recipe list
echo "<form name=\"recipeForm\" action=\"list_recipes.php\" method=\"post\">\n";
echo "<p><input type=\"checkbox\" name=\"hasTriedCheckbox\" onclick=\"showHideRecipes()\">";
echo "Only show recipes I\n";
echo "<SELECT name=\"hasTried\" onclick=\"showHideRecipes()\">\n";
echo "<option value=\"1\">have</option>\n";
echo "<option value=\"0\">have not</option>\n";
echo "</SELECT>\n";
echo "tried</p>\n<hr/>\n\n";

echo "<table border=\"0\" cellpadding=\"2\">\n";

if(mysql_num_rows($result) > 0) {
  echo "<tr><td><input type=\"checkbox\" name=\"selector\" onclick=\"checkBoxes()\"></td><td><b>Select all/none</b></td></tr>\n";
}

$i = 0;
while($row = mysql_fetch_array($result)) {
  echo "<tr class=\"";
  if($row['has_tried'] == 0) {
    echo "not_tried\">\n";
  }
  else {
    echo "tried\">\n";
  }

  echo "<td><input type=\"checkbox\" name=\"recipes_to_delete[]\" value=\"";
  echo $row['id'];
  echo "\"></td>\n";

  echo "<td><a href=\"view_recipe.php?id=" . $row['id'] . "\">";
  if($row['has_tried'] == 0) {
    echo "<i>";
  }
  echo $row['title'];
  if($row['has_tried'] == 0) {
    echo "</i>";
  }
  echo "</a>";

  echo "</td>\n</tr>\n\n";

  $i++;
}

echo "</table>\n\n";

// Hidden variables to pass information around
if($type) {
  echo "<input type=\"hidden\" name=\"category\" value=\"" . $type . "\">\n";
}
else if($text) {
  echo "<input type=\"hidden\" name=\"searchCategory\" value=\"" . $cat_id . "\">\n";
  echo "<input type=\"hidden\" name=\"textField\" value=\"" . $field . "\">\n";
  echo "<input type=\"hidden\" name=\"queryType\" value=\"" . $query_type . "\">\n";
  echo "<input type=\"hidden\" name=\"searchText\" value=\"" . $text . "\">\n";
}

echo "<p><input type=\"submit\" value=\"Delete Selected Recipes\" onclick=\"confirmDelete()\"></p>\n";
echo "</form>\n\n";

mysql_close($con);

require("footer.php");
?>
