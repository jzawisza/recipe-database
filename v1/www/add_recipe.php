<?php
require("header.php");

$con = mysql_connect("localhost","FILL_IN_USERNAME","FILL_IN_PASSWORD");
if (!$con) {
  die('Could not connect: ' . mysql_error());
}

mysql_select_db("jz_recipes",$con);

// There are 4 cases in which we call this page:
//
// 1) We want to add a recipe (no arguments)
// 2) We've just added a recipe (POST argument 'title')
// 3) We want to update a recipe (POST argument 'id')
// 4) We've just updated a recipe (POST arguments 'id' and 'update_recipe')
//
// In Case 2, we'll redisplay the page if we succeed.  In Case 4, we'll display
// a link back to view_recipe.php.

// Case 4
if($_POST['id'] and $_POST['update_recipe']) {
  $update = filter_input(INPUT_POST,"update_recipe",FILTER_VALIDATE_INT);
  if($update != 1) {
    die("<p>Could not validate update operation!</p>\n");
  }

  // Validate the variables
  $id = filter_input(INPUT_POST,"id",FILTER_VALIDATE_INT);
  $recipe_type = filter_input(INPUT_POST,"type",FILTER_VALIDATE_INT);
  $title = filter_input(INPUT_POST,"title",FILTER_SANITIZE_STRING);
  $source = filter_input(INPUT_POST,"source",FILTER_SANITIZE_STRING);
  // No need to filter a checkbox
  if($_POST['has_tried'] == "on") {
    $has_tried = 1;
  }
  else {
    $has_tried = 0;
  }
  $ingredients = filter_input(INPUT_POST,"ingredients",FILTER_SANITIZE_STRING);
  $preparation = filter_input(INPUT_POST,"preparation",FILTER_SANITIZE_STRING);
  $notes = filter_input(INPUT_POST,"notes",FILTER_SANITIZE_STRING);

  if(!$id) {
    die("<p>Error filtering recipe ID!</p>\n");
  }
  if($_POST['type'] && !$recipe_type) {
    die("<p>Error filtering recipe type!</p>\n");
  }
  else if($_POST['title'] && !$title) {
    die("<p>Error filtering recipe name!</p>\n");
  }
  else if($_POST['source'] && !$source) {
    die("<p>Error filtering recipe source!</p>\n");
  }
  else if($_POST['ingredients'] && !$ingredients) {
    die("<p>Error filtering recipe ingredients!</p>\n");
  }
  else if($_POST['preparation'] && !$preparation) {
    die("<p>Error filtering recipe preparation!</p>\n");
  }
  else if($_POST['notes'] && !$notes) {
    die("<p>Error filtering recipe notes!</p>\n");
  }

  // Add the recipe to the database
  $query = sprintf("UPDATE recipes SET tid = %d, has_tried = %d, source = '%s', title = '%s', ingredients = '%s', preparation = '%s', notes = '%s' WHERE ID = %d",
		   $recipe_type,
		   $has_tried,
		   mysql_real_escape_string($source),
		   mysql_real_escape_string($title),
		   mysql_real_escape_string($ingredients),
		   mysql_real_escape_string($preparation),
		   mysql_real_escape_string($notes),
		   $id);
  $result = mysql_query($query);

  if(!$result) {
    die('Could not update recipe: ' . mysql_error());
  }
  else {
    echo "<p>Recipe updated successfully!</p>\n\n";
    echo "<p><a href=\"view_recipe.php?id=$id\">View updated recipe</a></p>\n";
  }

  mysql_free_result($result);

  mysql_close($con);
  require("footer.php");

  exit();
}

// Case 3
else if($_POST['id']) {
  $id = filter_input(INPUT_POST,"id",FILTER_VALIDATE_INT);
  if(!$id) {
    die("<p>Could not validate recipe ID for update!</p>\n");
  }

  $query = "SELECT * FROM recipes WHERE id = $id";
  $result = mysql_query($query) or die('Could not look up recipe information: ' . mysql_error());

  $row = mysql_fetch_array($result);
  $type = $row['tid'];
  $has_tried = $row['has_tried'];
  $source = $row['source'];
  $title = $row['title'];
  $ingredients = $row['ingredients'];
  $preparation = $row['preparation'];
  $notes = $row['notes'];

  mysql_free_result($result);
}

// Case 2
else if($_POST['title']) {
  // Validate the variables
  $recipe_type = filter_input(INPUT_POST,"type",FILTER_VALIDATE_INT);
  $title = filter_input(INPUT_POST,"title",FILTER_SANITIZE_STRING);
  $source = filter_input(INPUT_POST,"source",FILTER_SANITIZE_STRING);
  // No need to filter a checkbox
  if($_POST['has_tried'] == "on") {
    $has_tried = 1;
  }
  else {
    $has_tried = 0;
  }
  $ingredients = filter_input(INPUT_POST,"ingredients",FILTER_SANITIZE_STRING);
  $preparation = filter_input(INPUT_POST,"preparation",FILTER_SANITIZE_STRING);
  $notes = filter_input(INPUT_POST,"notes",FILTER_SANITIZE_STRING);

  if($_POST['type'] && !$recipe_type) {
    die("<p>Error filtering recipe type!</p>\n");
  }
  else if($_POST['title'] && !$title) {
    die("<p>Error filtering recipe name!</p>\n");
  }
  else if($_POST['source'] && !$source) {
    die("<p>Error filtering recipe source!</p>\n");
  }
  else if($_POST['ingredients'] && !$ingredients) {
    die("<p>Error filtering recipe ingredients!</p>\n");
  }
  else if($_POST['preparation'] && !$preparation) {
    die("<p>Error filtering recipe preparation!</p>\n");
  }
  else if($_POST['notes'] && !$notes) {
    die("<p>Error filtering recipe notes!</p>\n");
  }

  // Add the recipe to the database
  $query = sprintf("INSERT INTO recipes(tid, has_tried, source, title, ingredients, preparation, notes) VALUES(%d, %d, '%s', '%s', '%s', '%s', '%s')",
		   $recipe_type,
		   $has_tried,
		   mysql_real_escape_string($source),
		   mysql_real_escape_string($title),
		   mysql_real_escape_string($ingredients),
		   mysql_real_escape_string($preparation),
		   mysql_real_escape_string($notes));
  $result = mysql_query($query);

  if(!$result) {
    die('Could not add recipe to database: ' . mysql_error());
  }
  else {
    echo "<p>Recipe added successfully!</p>\n";
  }

  mysql_free_result($result);

  // Since we're going to redisplay the page, unset the variables so we see
  // another add page rather than an update page
  unset($recipe_type);
  unset($title);
  unset($source);
  unset($ingredients);
  unset($preparation);
  unset($notes);
}

// Display the main page

// Get all the recipe types for a drop-down list
$result = mysql_query("SELECT tid, type FROM recipe_types ORDER BY type") or die("Could not get recipe categories: " . mysql_error());

echo <<<END
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
    if(validate_required(title,"You must specify a name for this recipe.")==false) {
      title.focus();
      return false;
    }
    else if(validate_required(ingredients,"You must specify a list of ingredients.")==false) {
      ingredients.focus();
      return false;
    }
    else if(validate_required(preparation,"You must specify how to prepare this recipe.")==false) {
      preparation.focus();
      return false;
    }
  }

  return true;
}
</script>

<table border="0" width="75%">
<form action="add_recipe.php" onsubmit="return check_input(this)" method="post">

<tr>
<td class="recipe" width="25%">Type of Recipe</td>
<td>
<select name="type">
END;

while($row = mysql_fetch_array($result)) {
  if($type == $row['tid']) {
    $selected_str = " selected";
  }
  else {
    $selected_str = "";
  }
  echo "<option value=\"" . $row['tid'] . "\"" . $selected_str . ">" . $row['type'] . "</option>\n";
}

mysql_free_result($result);

echo <<<END
</select>
</td>
</tr>

<tr>
<td class="recipe" width="25%">Name</td>

END;

if($title) {
  $value_str = " value=\"$title\"";
}
echo "<td><input type=\"text\" size=\"75\" name=\"title\"" . $value_str . "></input></td>\n";

echo <<<END
</tr>

<tr>
<td class="recipe" width="25%">Source</td>

END;

if($source) {
  $value_str = " value=\"$source\"";
}
echo "<td><input type=\"text\" size=\"75\" name=\"source\"" . $value_str . "></input></td>\n";

echo <<<END
</tr>

<tr>

END;

if($has_tried == 1) {
  $checked_str = " checked";
}
echo "<td class=\"recipe\" colspan=\"2\"><input type=\"checkbox\" name=\"has_tried\"" . $checked_str . ">&nbsp;I have made this recipe before</input></td>\n";

echo <<<END
</tr>

<tr>
<td colspan="2">&nbsp;</td>
</tr>

<tr>
<td class="recipe" colspan="2">Ingredients</td>
</tr>

<tr>

END;

echo "<td colspan=\"2\"><textarea rows=\"10\" cols=\"80\" name=\"ingredients\">$ingredients</textarea></td>\n";

echo <<<END
</tr>

<tr>
<td colspan="2">&nbsp;</td>
</tr>

<tr>
<td class="recipe" colspan="2">Preparation</td>
</tr>

<tr>

END;

echo "<td colspan=\"2\"><textarea rows=\"10\" cols=\"80\" name=\"preparation\">$preparation</textarea></td>\n";

echo <<<END
</tr>

<tr>
<td colspan="2">&nbsp;</td>
</tr>

<tr>
<td class="recipe" colspan="2">Notes</td>
</tr>

<tr>

END;

echo "<td colspan=\"2\"><textarea rows=\"10\" cols=\"80\" name=\"notes\">$notes</textarea></td>\n";

echo <<<END
</tr>

<tr>
<td>
<input type="submit" value="Submit Recipe"/>

END;

if($id) {
  echo "<input type=\"hidden\" name=\"id\" value=\"$id\">\n";
  echo "<input type=\"hidden\" name=\"update_recipe\" value=\"1\">\n";
}

echo <<<END
</td>
</tr>

</form>
</table>
END;

mysql_close($con);

require("footer.php");

?>
