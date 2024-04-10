<!DOCTYPE html>
<html>
<head>
    <title>Search Results</title>
</head>
<body>
    <?php
    if(isset($_GET['query'])) {
        $search = $_GET['query'];
        echo "<h2>Search Results for: $search</h2>";
    } else {
        echo "<h2>Nothing searched.</h2>";
    }
    ?>
</body>
</html>