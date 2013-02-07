<?php

require_once("MysqlConnector.php");
require_once("MysqlTaskStorage.php");

//the connector holds the mysql-connection
$mysql = new MysqlConnector();
$storage = new MysqlTaskStorage($mysql);

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
    $storage->updateTask($user, $taskId, $newText);
}

?>
