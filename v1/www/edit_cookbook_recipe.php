<!-- Copied from header.php, but excludes the navigation bar -->
<!DOCTYPE html
PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
  <link rel="stylesheet" href="./jzrd.css" type="text/css" />
  <title>Recipe Database 0.2</title>
  <meta content="text/html; charset=ISO-8859-1" http-equiv="content-type" />
  <meta content="Jim Zawisza" name="author" />
  <meta content="Recipe database page" name="description" />

<script type="text/javascript">
// Close the pop-up window on success
function closePage()
{
  // Reload the main page to see the changes we just made
  window.opener.location.reload();
  window.close();
}
</script>

</head>

<?php
$con = mysql_connect("localhost","FILL_IN_USERNAME","FILL_IN_PASSWORD");
if (!$con) {
  die('Could not connect: ' . mysql_error());
}

mysql_select_db("jz_recipes",$con);

// We're either calling this page to edit a recipe, or to process an edit we
// just made
if($_GET['id']) {
  $id = filter_input(INPUT_GET,"id",FILTER_VALIDATE_INT);

  $result = mysql_query("SELECT cid, page_num, has_tried, title FROM cookbook_recipes WHERE id = " . $id) or die("Could not look up recipe in database: " . mysql_error());
  $query = mysql_query($query);
  $row = mysql_fetch_array($result);
  $cid = $row['cid'];
  $page_num = $row['page_num'];
  $has_tried = $row['has_tried'];
  $title = $row['title'];
  mysql_free_result($result);
?>

<body>
  <div class="container">
  <div class="content">

<form action="edit_cookbook_recipe.php" method="post">
<table border="0" width="50%">

<tr>
<td class="recipe">
Cookbook
</td>
<td>
<select name="cid">

<?php
   $result = mysql_query("SELECT cid, name FROM cookbooks ORDER BY name") or die("Could not get cookbooks: " . mysql_error());

  while($row = mysql_fetch_array($result)) {
    echo "<option value=\"" . $row['cid'] . "\"";
    if($row['cid'] == $cid) {
      echo " selected=\"selected\"";
    }
    echo ">" . $row['name'] . "</option>\n";
  }

  mysql_free_result($result);
?>

</select>
</tr>

<tr>
</td>
<td class="recipe">
Page Number
</td>
<td>
<?php
  echo "<input type=\"text\" name=\"pagenum\" size=\"4\" value=\"" . $page_num . "\">\n";
?>
</td>
</tr>

<tr>
<td class="recipe" colspan="2">
<?php
  echo "<input type=\"checkbox\" name=\"has_tried\"";
  if($has_tried) {
    echo " checked";
  }
  echo "/>\n";
?>
&nbsp;I have made this recipe before
</td>
</tr>

<tr>
<td class="recipe">
Title
</td>
<td>
<?php
  echo "<input type=\"text\" name=\"title\" size=\"75\" value=\"" . $title . "\"/>\n";
?>
</td>
</tr>

<tr>
<td>
<input type="submit" value="Edit Cookbook Recipe">
</td>
</tr>

</table>
<?php
  echo "<input type=\"hidden\" name=\"id\" value=\"" . $id . "\">\n";
?>
</form>

<?php
}
// Processing an edit
else {
  $id = filter_input(INPUT_POST,"id",FILTER_VALIDATE_INT);
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

  if(!$id) {
    die("<p>Error filtering recipe ID!</p>\n");
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

  $query = sprintf("UPDATE cookbook_recipes SET cid=%d, page_num=%d, has_tried=%d, title='%s' WHERE id = %d",
		   $cid,
		   $pagenum,
		   $has_tried,
		   mysql_real_escape_string($title),
		   $id);

  $result = mysql_query($query);

  if(!$result) {
    die('Could not update recipe in database: ' . mysql_error());
  }
  else {
    // Display the header with some Javascript to automatically close the page
    echo "<body onLoad=\"closePage()\">\n";
    echo "  <div class=\"container\">\n";
    echo "  <div class=\"content\">\n";
  }

  mysql_free_result($result);
}

mysql_close($con);

require("footer.php");
?>
