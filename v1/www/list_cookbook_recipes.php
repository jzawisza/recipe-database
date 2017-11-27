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
  $query = "DELETE FROM cookbook_recipes WHERE (";

  foreach ($_POST['recipes_to_delete'] as $rid) {
    $query .= "id = $rid OR ";
  }

  // Add a trailing query that's guaranteed to fail so the last statement is
  // trivially true
  $query .= "id = 0)";

  mysql_query($query) or die("Could not delete recipes: " . mysql_error());
}

$query = "SELECT id, title, has_tried, page_num, name FROM cookbook_recipes, cookbooks";

// Case 3
if($_POST['searchText']) {
  // Validate the search query data
  $cookbook_id = filter_input(INPUT_POST,"searchCookbook",FILTER_VALIDATE_INT);
  $query_type = filter_input(INPUT_POST,"queryType",FILTER_SANITIZE_STRING);
  $text = filter_input(INPUT_POST,"searchText",FILTER_SANITIZE_STRING);

  if(!$cookbook_id) {
    die("<p>Error validating search cookbook!</p>\n");
  }
  if(!$query_type) {
    die("<p>Error validating search type!</p>\n");
  }
  if(!$text) {
    die("<p>Error validating search string!</p>\n");
  }

  if($cookbook_id != -1) {
    $query .= " WHERE cookbook_recipes.cid = $cookbook_id AND ";
  }
  else {
    $query .= " WHERE ";
  }

  $query .= "title LIKE ";

  if($query_type == "contains") {
    $query .= "\"%" . $text . "%\"";
  }
  else {
    $query .= "\"" . $text . "\"";
  }

  $query .= " AND ";
}
// Case 2
else if($_GET['cookbook']) {
  $type = filter_input(INPUT_GET,"cookbook",FILTER_VALIDATE_INT);
  if(!$type) {
    die("<p>Error filtering cookbook!</p>\n");
  }

  $query .= " WHERE cookbook_recipes.cid = ";
  $query .= $type;
  $query .= " AND ";
}
else if($_POST['category']) {
  // Since INPUT_REQUEST isn't implemented yet, we need two else if statements
  // for this case.  The categry information can come from index.php via GET,
  // or from a delete operation from this page via POST.
  $type = filter_input(INPUT_POST,"cookbook",FILTER_VALIDATE_INT);
  if(!$type) {
    die("<p>Error filtering cookbook!</p>\n");
  }

  $query .= " WHERE cookbook_recipes.cid = ";
  $query .= $type;
  $query .= " AND ";
}
else {
  // If we get here, the query has no WHERE clauses, so just add WHERE to do
  // the final part of the query
  $query .= " WHERE ";
}

// The final part of the query
$query .= "cookbook_recipes.cid = cookbooks.cid";

// 2008-11-03: sort recipes by page number
$query .= " ORDER BY page_num";

$result = mysql_query($query) or die("Could not get list of recipes: " . mysql_error());

$num_rows = mysql_num_rows($result);
echo "\n<p>&nbsp;$num_rows cookbook ";
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

// Pop up the Edit Cookbook Recipe window
function popupEditWindow(id) {
  window.open("edit_cookbook_recipe.php?id=" + id,"Edit Cookbook Recipe","height=150,width=700");
  return false;
}
</script>

END;

// Recipe list
echo "<form name=\"recipeForm\" action=\"list_cookbook_recipes.php\" method=\"post\">\n";
echo "<p><input type=\"checkbox\" name=\"hasTriedCheckbox\" onclick=\"showHideRecipes()\">";
echo "Only show recipes I\n";
echo "<SELECT name=\"hasTried\" onclick=\"showHideRecipes()\">\n";
echo "<option value=\"1\">have</option>\n";
echo "<option value=\"0\">have not</option>\n";
echo "</SELECT>\n";
echo "tried</p>\n<hr/>\n\n";

echo "<table border=\"1\" cellpadding=\"2\">\n";

echo "<tr><th>&nbsp;</th><th bgcolor=\"gray\">Cookbook</th><th bgcolor=\"gray\">Recipe Name</th><th bgcolor=\"gray\">Page Number</th></tr>\n";

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

  echo "<td>" . $row['name'] . "</td>\n";

  echo "<td>";
  if($row['has_tried'] == 0) {
    echo "<i>";
  }
  echo "<a href=\"#\" onclick=\"popupEditWindow(" . $row['id'] . ")\">" . $row['title'] . "</a>";
  if($row['has_tried'] == 0) {
    echo "</i>";
  }
  echo "</td>\n";

  echo "<td>" . $row['page_num'] . "</td>\n";

  echo "</tr>\n\n";

  $i++;
}

if(mysql_num_rows($result) > 0) {
  echo "<tr><td><input type=\"checkbox\" name=\"selector\" onclick=\"checkBoxes()\"></td><td bgcolor=\"gray\"><b>Select all/none</b></td></tr>\n";
}

echo "</table>\n\n";

// Hidden variables to pass information around
if($type) {
  echo "<input type=\"hidden\" name=\"cookbook\" value=\"" . $type . "\">\n";
}
else if($text) {
  echo "<input type=\"hidden\" name=\"searchCookbook\" value=\"" . $cookbook_id . "\">\n";
  echo "<input type=\"hidden\" name=\"queryType\" value=\"" . $query_type . "\">\n";
  echo "<input type=\"hidden\" name=\"searchText\" value=\"" . $text . "\">\n";
}

echo "<p><input type=\"submit\" value=\"Delete Selected Recipes\" onclick=\"confirmDelete()\"></p>\n";
echo "</form>\n\n";

mysql_close($con);

require("footer.php");
?>
