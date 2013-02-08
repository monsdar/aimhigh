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
    
    public function createTask($user, $newText)
    {        
        //get the ID of the given user
        $userId = 0;
        $userIdQuery = "SELECT KeyId FROM userkeys WHERE UserKey='%s';";
        $userIdQuery = sprintf($userIdQuery, $user);
        $userIdResult = mysql_query($userIdQuery);
        if( $userIdResult && mysql_num_rows($userIdResult) != 0 )
        {
            $userId = (int)mysql_result($userIdResult, 0, 0);
        }
        else
        {
            //simply return nothing if the user does not exist
            echo("User " . $user . " does not exist");
            return;
        }
        
        //add the new task
        $createTaskQuery = "INSERT INTO tasks (KeyId, Text) VALUES (%d, '%s')";
        $createTaskQuery = sprintf($createTaskQuery, $userId, $newText);
        mysql_query($createTaskQuery);
        
        echo("New task created successfully");
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
        
        echo("Everything deleted without any problems...");
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
        
        echo("Updated task # " . $taskId . " of user " . $user . " successfully");
    }
    
    public function touchUser($user)
    {
        //TODO: Prevent MySQL-injection here!
        $createUser = "INSERT INTO userkeys (UserKey) VALUES ('%s')";
        $createUser = sprintf($createUser, $user);
        $createResult = mysql_query($createUser);
        if(!$createResult)
        {
            echo("User " . $user . " already exists...");
        }
        else
        {
            echo("Created user " . $user . "...");
            
            //add some example tasks to the new user
            $this->createTask($user, "Eat fruits or vegetables");
            $this->createTask($user, "Exercise for 30 minutes or more");
            $this->createTask($user, "Talk to a friend");
            echo("Added some sample-tasks...");
        }
    }
}

?>
