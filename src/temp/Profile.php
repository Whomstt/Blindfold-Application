<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Profile</title>
    <link rel="stylesheet" href="Profile.css">
</head>
<body>
    <div class="container">
        <h2>User Profile</h2>
        <?php
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $name = $_POST['name'];
            $age = $_POST['age'];
            $gender = $_POST['gender'];
            $description = $_POST['description'];

            echo "<p><strong>Name:</strong> $name</p>";
            echo "<p><strong>Age:</strong> $age</p>";
            echo "<p><strong>Gender:</strong> $gender</p>";
            echo "<p><strong>Description:</strong> $description</p>";
        }
        ?>
    </div>
</body>
</html>
