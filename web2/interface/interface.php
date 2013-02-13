<?php

require_once("MysqlConnector.php");
require_once("MysqlTaskStorage.php");

//the connector holds the mysql-connection
$mysql = new MysqlConnector();
$storage = new MysqlTaskStorage($mysql);

//escape any incoming MySQL-code at first...
foreach($_POST as $name => $value)
{
    $_POST[$name] = mysql_real_escape_string($value);
}

//check the POST for incoming requests
$user = $_POST['userkey'];
$request = $_POST['request'];

if($request == 'getTasks')
{
    $tasks = $storage->readTasks($user);
    echo( json_encode($tasks) );
}
else if($request == 'removeTask')
{
    $taskId = $_POST['taskid'];
    $storage->deleteTask($user, $taskId);
}
else if($request == 'updateTask')
{
    $taskId = $_POST['taskid'];
    $newText = $_POST['text'];
    $category = $_POST['category'];
    $storage->updateTask($user, $taskId, $newText, $category);
}
else if($request == 'createTask')
{
    $newText = $_POST['text'];
    $category = $_POST['category'];
    $storage->createTask($user, $newText, $category);
}
else if($request == 'touchUser')
{
    //HAHA, That's an awkward name :D
    //The Linux' touch command is meant:
    //  It creates a file if it does not exist
    //  and opens it, if it exists...
    //So this command just creates a new user if it does not exist yet...
    $storage->touchUser($user);
}
else if($request == 'toggleTask')
{
    $taskId = $_POST['taskid'];
    $date = $_POST['date'];
    $storage->toggleTask($user, $taskId, $date);
}

?>
