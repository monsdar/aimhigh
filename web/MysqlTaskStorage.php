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
        //get a valid primary key for the new task (higher than the current maximum key)
        $maxId = 0;
        $maxIdQuery = "SELECT MAX(TaskId) FROM tasks;";
        $maxIdResult = mysql_query($maxIdQuery);
        if( $maxIdResult && mysql_num_rows($maxIdResult) != 0 )
        {
            $maxId = (int)mysql_result($maxIdResult, 0, 0);
            $maxId++; //increase the id for our new task
        }
     
        $newTask = new Task($maxId);
        $newTask->setText($text);
        
        //add the task to the database
        //
        //TODO: Prevent SQL injection
        $addTaskQuery = "INSERT INTO tasks VALUES (%d, '%s');";
        $addTaskQuery = sprintf($addTaskQuery, $newTask->getIndex(), $newTask->getText());
        mysql_query($addTaskQuery);
        
        //return it, so we can work with it
        return $newTask;
    }

    public function deleteTask($task)
    {
        //simply delete, if there is no such task, it won't harm...
        //so no checking needed
        //
        //TODO: Prevent SQL injection
        $removeTaskQuery = "DELETE FROM tasks WHERE TaskId=%d;";
        $removeTaskQuery = sprintf($removeTaskQuery, $task->getIndex());
        mysql_query($removeTaskQuery);
        
        //delete all the activations belonging to the given task
        $removeActQuery = "DELETE FROM activations WHERE TaskId=%d;";
        $removeActQuery = sprintf($removeActQuery, $task->getIndex());
        mysql_query($removeActQuery);        
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
