<?php
define("COOKING_LIGHT", "Cooking Light");
define("RECIPE_JSON_ELEMENT", "//script[@type='application/ld+json']");
define("RECIPE_DATE_ELEMENT", "//span[@class='recipe-date']");
define("RECIPE_STEP_ELEMENT", "//div[@class='step']/p[2]");
define("TYPE_KEY", "@type");
define("TYPE_VALUE_RECIPE", "Recipe");
define("INGREDIENT_KEY", "recipeIngredient");
define("SERVES_KEY", "recipeYield");
define("SERVES_REGEX", "/Serves (\d+)/");
define("NUTRITION_KEY", "nutrition");
define("CALORIES_KEY", "calories");

// Given a Cooking Light recipe URL, extract the recipe title,
// e.g. http://www.cookinglight.com/recipes/banana-walnut-bread => Banana Walnut Bread
function getTitleFromUrl($recipe_url) {
	$url_parts = explode("/", parse_url($recipe_url, PHP_URL_PATH));
	$last_url_part_index = count($url_parts) - 1;
	$recipe_words = explode("-", $url_parts[$last_url_part_index]);
	$title = "";
	foreach($recipe_words as $word) {
		$title .= $word . " ";
	}
	return trim(ucwords($title));
}

require("header.php");

$con = mysql_connect("localhost","FILL_IN_USERNAME","FILL_IN_PASSWORD");
if (!$con) {
  die('Could not connect: ' . mysql_error());
}

mysql_select_db("jz_recipes",$con);

// If we got here from the user clicking Submit on this page,
// try to add the recipe
if($_POST['recipe_url']) {
  $recipe_url = filter_input(INPUT_POST,"recipe_url",FILTER_VALIDATE_URL);
  $recipe_type = filter_input(INPUT_POST,"type",FILTER_VALIDATE_INT);

  // No need to filter a checkbox
  if($_POST['has_tried'] == "on") {
    $has_tried = 1;
  }
  else {
    $has_tried = 0;
  }

  // Get title from the recipe URL itself
  $title = getTitleFromUrl($recipe_url);

  $doc = new DOMDocument;
  libxml_use_internal_errors(true);
  $url_contents = file_get_contents($recipe_url);
  $doc->loadHTML($url_contents);
  $xpath = new DOMXPath($doc);

  // Get source by concatenating fixed string with recipe data from HTML
  $date_list = $xpath->query(RECIPE_DATE_ELEMENT);
  if(is_null($date_list)) {
    die('<p>Error getting recipe date</p>');
  }
  $recipe_date = trim($date_list->item(0)->nodeValue);
  $source = COOKING_LIGHT . ", " . $recipe_date;

  // Get preparation by combining steps from HTML
  $recipe_step_list = $xpath->query(RECIPE_STEP_ELEMENT);
  if(is_null($recipe_step_list)) {
    die('<p>Error getting steps for recipe</p>');
  }
  $preparation = "";
  foreach($recipe_step_list as $recipe_step) {
    $preparation .= $recipe_step->nodeValue . "\n\n";
  }
  // Remove trailing newlines
  $preparation_len = strlen($preparation);
  $preparation = substr($preparation, 0, $preparation_len - 2);

  // Get title, ingredients, serves, and calories from recipe JSON
  $rlist = $xpath->query(RECIPE_JSON_ELEMENT);
  if(is_null($rlist)) {
    die('<p>Error getting recipe JSON</p>');
  }
  $script_text = $rlist->item(0)->nodeValue;
  $recipe_json = json_decode($script_text, true);

  if(!is_array($recipe_json)) {
    die('<p>Expected array when parsing recipe</p>');
  }

  foreach($recipe_json as $key=>$value) {
    $array_data = $value;
    if(is_array($array_data) && !strcmp($array_data[TYPE_KEY], TYPE_VALUE_RECIPE)) {
      $ingredients = "";
      $ingredient_array = $array_data[INGREDIENT_KEY];
      for($i = 0; $i < count($ingredient_array); $i++) {
        $ingredients .= $ingredient_array[$i] . "\n";
      }
      $serves_string = $array_data[SERVES_KEY];
      preg_match(SERVES_REGEX, $serves_string, $matches);
      $serves = intval($matches[1]);
      $nutrition_array = $array_data[NUTRITION_KEY];
      $calories = intval($nutrition_array[CALORIES_KEY]);
    }
  }

  if(!$source) {
    die('<p>Error getting recipe source</p>');
  }
  else if(!$title) {
    die('<p>Error getting recipe title</p>');
  }
  else if(!$ingredients) {
    die('<p>Error getting recipe ingredients</p>');
  }
  else if(!$preparation) {
    die('<p>Error getting recipe steps</p>');
  }
  else if(!$serves || !is_int($serves)) {
    die('<p>Error getting number served by recipe</p>');
  }
  else if(!$calories || !is_int($calories)) {
    die('<p>Error getting recipe calories per serving</p>');
  }

  $column_names = "tid, has_tried, source, title, ingredients, preparation, serves, calories_per_serving";
  $column_values = sprintf("%d, %d, '%s', '%s', '%s', '%s', %d, %d",
       $recipe_type,
       $has_tried,
       mysql_real_escape_string($source),
       mysql_real_escape_string($title),
       mysql_real_escape_string($ingredients),
       mysql_real_escape_string($preparation),
       $serves,
       $calories);

  $query = "INSERT INTO recipes(" . $column_names . ") VALUES(" . $column_values . ")";
  $result = mysql_query($query);

  if(!$result) {
    die('Could not add recipe to database: ' . mysql_error());
  }
  else {
   echo "<p>Recipe imported successfully!</p>\n";
  }

  mysql_free_result($result);

  // Since we're going to redisplay the page, unset the variables
  unset($recipe_url);
  unset($recipe_type);
  unset($title);
  unset($source);
  unset($ingredients);
  unset($preparation);
  unset($serves);
  unset($calories);
}

// Get all the recipe types for a drop-down list
$result = mysql_query("SELECT tid, type FROM recipe_types ORDER BY type") or die("Could not get recipe categories: " . mysql_error());

// Display the main page
echo <<<END
<p>Import a Cooking Light recipe from their web site.</p>
<table border="0" width="75%">
<form action="import_recipe.php" method="post">

<tr>
<td class="recipe" width="25%">Cooking Light Recipe URL</td>
<td>
<input type="text" size="75" name="recipe_url" />
</td>
</tr>

<tr>
<td class="recipe" width="25%">Type of Recipe</td>
<td>
<select name="type">
END;

while($row = mysql_fetch_array($result)) {
  echo "<option value=\"" . $row['tid'] . "\">" . $row['type'] . "</option>\n";
}

mysql_free_result($result);

echo <<<END
</select>
</td>
</tr>

<tr>
<td class="recipe" colspan="2">
<input type="checkbox" name="has_tried">&nbsp;I have made this recipe before</input>
</td>
</tr>

<tr>
<td>
<input type="submit" value="Submit Recipe"/>
</td>
</tr>

</form>
</table>
END;

mysql_close($con);

require("footer.php");

?>
