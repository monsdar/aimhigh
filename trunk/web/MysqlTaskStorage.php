<?php

require_once("ITaskStorage.php");
require_once("Task.php");
require_once("Activation.php");

class MysqlTaskStorage implements ITaskStorage
{
    private $mysql;
    
    public function __construct($mysqlConnector)
    {
        $this->mysql = $mysqlConnector;
    }
    
    public function createTask($text)
    {
        print("Creating task with " . $text);
    }

    public function deleteTask($task)
    {
        print("Removing task #" . $task->id);
    }

    public function readTasks()
    {
        $allTasks = array();
        print("Reading all the tasks...");
        return $allTasks;
    }

    public function updateTask($task)
    {
        print("Updating Task #" . $task->id);
    }
}

?>
