<?php

require_once("MysqlConnector.php");
require_once("MysqlTaskStorage.php");
require_once("Logging.php");

//check if there are any non-wanted POST-variables
$whitelist = array();
$whitelist[] = 'userkey';
$whitelist[] = 'request';
$whitelist[] = 'getTasks';
$whitelist[] = 'removeTask';
$whitelist[] = 'taskid';
$whitelist[] = 'updateTask';
$whitelist[] = 'title';
$whitelist[] = 'text';
$whitelist[] = 'isnegative';
$whitelist[] = 'category';
$whitelist[] = 'createTask';
$whitelist[] = 'touchUser';
$whitelist[] = 'toggleTask';
$whitelist[] = 'date';


//set path and name of log file
foreach($_POST as $name => $value)
{
    if( !in_array($name, $whitelist) )
    {
        $log = new Logging();
        $log->lfile('test.log');
        $message = "Given entry is not on whitelist!";
        $log->lwrite($message);
        $log->lwrite("\t" . $name . " -> " . $value);
        $log->lclose();
        exit($message);
    }
}

//the connector holds the mysql-connection
$mysql = new MysqlConnector();
$storage = new MysqlTaskStorage($mysql);

//escape any incoming MySQL-code at first...
foreach($_POST as $name => $value)
{
    $_POST[$name] = $mysql->handle()->real_escape_string($value);
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
    $newTitle = $_POST['title'];
    $newText = $_POST['text'];
    $isNegative = $_POST['isnegative'];
    $category = $_POST['category'];
    $storage->updateTask($user, $taskId, $newTitle, $newText, $category, $isNegative);
}
else if($request == 'createTask')
{
    $newTitle = $_POST['title'];
    $newText = $_POST['text'];
    $category = $_POST['category'];
    $isNegative = $_POST['isnegative'];
    $storage->createTask($user, $newTitle, $newText, $category, $isNegative);
}
else if($request == 'touchUser')
{
    //HAHA, That's an awkward name :D
    //The Linux' touch command is meant:
    //  It creates a file if it does not exist
    //  and opens it, if it exists...
    //So this command just creates a new user if it does not exist yet...
    //It also returns true if a new user has been created, else it returns false
    $result = $storage->touchUser($user);
    echo( json_encode($result) );
}
else if($request == 'toggleTask')
{
    $taskId = $_POST['taskid'];
    $date = $_POST['date'];
    $storage->toggleTask($user, $taskId, $date);
}

?>
