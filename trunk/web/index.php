<?php

require_once("MysqlTaskStorage.php");
require_once("MysqlConnector.php");

//the connector holds the mysql-connection
$mysql = new MysqlConnector();
$storage = new MysqlTaskStorage($mysql);

//create some tasks
$storage->createTask("This is a new first task");

//read the tasks
$tasks = $storage->readTasks();
foreach($tasks as $task)
{
    echo($task->getIndex() . ' - ' . $task->getText() . '<br/>');
}

//update a task
$lastTaskIndex = count($tasks)-1;
$tasks[$lastTaskIndex]->setText("Im edited now!");
$tasks[$lastTaskIndex]->activate(0);
$storage->updateTask($tasks[$lastTaskIndex]);

//finally, delete the lastly created task
$storage->deleteTask($tasks[ $lastTaskIndex ]);

?>
