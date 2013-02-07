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

    public function deleteTask($user, $taskId)
    {
        //simply delete. If there is no such task, it won't harm...
        //so no checking needed
        //
        //TODO: Prevent SQL injection
        //TODO: How to prevent someone just deleting anything with a bruteforce? This would suck...
        $removeTaskQuery = "DELETE tasks FROM tasks,userkeys WHERE TaskId=%d AND tasks.KeyId=userkeys.KeyId AND UserKey='%s'";
        $removeTaskQuery = sprintf($removeTaskQuery, $taskId, $user);
        mysql_query($removeTaskQuery);
        
        //delete all the activations belonging to the given task
        $removeActQuery = "DELETE FROM activations WHERE TaskId=%d;";
        $removeActQuery = sprintf($removeActQuery, $taskId);
        mysql_query($removeActQuery);
    }

    public function readTasks($user)
    {
        $allTasks = array();
        
        $readTasksQuery = "SELECT * FROM tasks, userkeys WHERE tasks.KeyId=userkeys.KeyId AND userkeys.UserKey='%s'";
        $readTasksQuery = sprintf($readTasksQuery, $user);
        $tasksResult = mysql_query($readTasksQuery);
        while($taskRow = mysql_fetch_array($tasksResult) )
        {
            $newTask = new Task( $taskRow['TaskId'] );
            $newTask->setText($taskRow['Text']);
            
            $readActivations = "SELECT * FROM activations WHERE TaskId=%d";
            $readActivations = sprintf($readActivations, $taskRow['TaskId']);
            $actResult = mysql_query($readActivations);
            while($actRow = mysql_fetch_array($actResult) )
            {
                $newAct = new Activation( $actRow['ActivationId'] );
                $newAct->setTimestamp($actRow['ActivationTime']);
                $newTask->addActivation($newAct);
            }
            
            $allTasks[] = $newTask;
        }
        
        return $allTasks;
    }

    public function updateTask($user, $taskId, $newText)
    {
        //Update the given task (do nothing if it does not work... who cares?)
        //TODO: Prevent MySQL-injection here!
        $updateTask = "UPDATE tasks, userkeys SET Text='%s' WHERE TaskId=%d AND tasks.KeyId=userkeys.KeyId AND UserKey='%s'";
        $updateTask = sprintf($updateTask, $newText, $taskId, $user);
        mysql_query($updateTask);
    }
}

?>
