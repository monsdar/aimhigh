<?php

require_once './MysqlConnector.php';

//the connector holds the mysql-connection
$mysql = new MysqlConnector();

echo("IsConnected: " . $mysql->isConnected() . "<br/>");

//get the tasks
$tasksQuery = "SELECT * FROM tasks";
$tasksResult = mysql_query($tasksQuery);

//check if there are any results
if(!$tasksResult)
{
    echo("ERROR: Cannot get any tasks<br/>");
}
else
{
    echo("<br/>Tasks:<br/>");
}

//iterate through the results (if any) and print them
while($row = mysql_fetch_array($tasksResult) )
{
    echo($row['TaskId'] . " - " . $row['text'] . "<br/>");
}

?>
