<?php

require_once("TempTaskStorage.php");
require_once("MysqlTaskStorage.php");
require_once("MysqlConnector.php");

//the connector holds the mysql-connection
//$mysql = new MysqlConnector();
//$storage = new MysqlTaskStorage($mysql);
$storage = new TempTaskStorage($mysql);

//create some tasks
$storage->createTask("This is the first task");
$storage->createTask("This is the second task");

//read the tasks
$tasks = $storage->readTasks();

//update a task
$tasks[0]->setText("Im edited now!");
$storage->updateTask($tasks[0]);

//finally, delete one of the tasks
$storage->deleteTask($tasks[1]);

?>
