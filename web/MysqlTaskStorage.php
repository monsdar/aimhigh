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
    
    public function createTask($user, $newText, $category)
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
            echo("User " . $user . " does not exist<br/>");
            return;
        }
        
        //get the categoryId
        $catId = 0;
        $catIdQuery = "SELECT CategoryId FROM categories WHERE Name='%s';";
        $catIdQuery = sprintf($catIdQuery, $category);
        $catIdResult = mysql_query($catIdQuery);
        if( $catIdResult && mysql_num_rows($catIdResult) != 0 )
        {
            $catId = (int)mysql_result($catIdResult, 0, 0);
        }
        else
        {
            //simply return nothing if the user does not exist
            echo("Category " . $category . " does not exist<br/>");
            return;
        }
        
        //add the new task
        $createTaskQuery = "INSERT INTO tasks (KeyId, CategoryId, Text) VALUES (%d, %d, '%s')";
        $createTaskQuery = sprintf($createTaskQuery, $userId, $catId, $newText);
        mysql_query($createTaskQuery);
        
        echo("New task created successfully<br/>");
    }

    public function deleteTask($user, $taskId)
    {
        //simply delete. If there is no such task, it won't harm...
        //so no checking needed
        //
        //TODO: How to prevent someone just deleting anything with a bruteforce? This would suck...
        $removeTaskQuery = "DELETE tasks FROM tasks,userkeys WHERE TaskId=%d AND tasks.KeyId=userkeys.KeyId AND UserKey='%s'";
        $removeTaskQuery = sprintf($removeTaskQuery, $taskId, $user);
        mysql_query($removeTaskQuery);
        
        //delete all the activations belonging to the given task
        $removeActQuery = "DELETE FROM activations WHERE TaskId=%d;";
        $removeActQuery = sprintf($removeActQuery, $taskId);
        mysql_query($removeActQuery);
        
        echo("Everything deleted without any problems...<br/>");
    }

    public function readTasks($user)
    {
        $allTasks = array();
        
        $readTasksQuery = "SELECT * FROM tasks, userkeys, categories WHERE tasks.KeyId=userkeys.KeyId AND userkeys.UserKey='%s' AND tasks.CategoryId=categories.CategoryId";
        $readTasksQuery = sprintf($readTasksQuery, $user);
        $tasksResult = mysql_query($readTasksQuery);
        while($taskRow = mysql_fetch_array($tasksResult) )
        {
            $newTask = new Task();
            $newTask->index = $taskRow['TaskId'];
            $newTask->text = $taskRow['Text'];
            $newTask->category = $taskRow['Name'];
            
            $readActivations = "SELECT ActivationId, ActivationDate FROM activations WHERE TaskId=%d";
            $readActivations = sprintf($readActivations, $taskRow['TaskId']);
            $actResult = mysql_query($readActivations);
            while($actRow = mysql_fetch_array($actResult) )
            {
                $newAct = new Activation();
                $newAct->index = $actRow['ActivationId'];
                $newAct->date = $actRow['ActivationDate'];
                $newTask->activations[] = $newAct;
            }
            
            $allTasks[] = $newTask;
        }
        
        return $allTasks;
    }

    public function updateTask($user, $taskId, $newText, $category)
    {
        //get the categoryId
        $catId = 0;
        $catIdQuery = "SELECT CategoryId FROM categories WHERE Name='%s';";
        $catIdQuery = sprintf($catIdQuery, $category);
        $catIdResult = mysql_query($catIdQuery);
        if( $catIdResult && mysql_num_rows($catIdResult) != 0 )
        {
            $catId = (int)mysql_result($catIdResult, 0, 0);
        }
        else
        {
            //simply return nothing if the user does not exist
            echo("Category " . $category . " does not exist<br/>");
            return;
        }
        
        //Update the given task (do nothing if it does not work... who cares?)
        $updateTask = "UPDATE tasks, userkeys SET Text='%s', CategoryId=%d WHERE TaskId=%d AND tasks.KeyId=userkeys.KeyId AND UserKey='%s'";
        $updateTask = sprintf($updateTask, $newText, $catId, $taskId, $user);
        mysql_query($updateTask);
        
        echo("Updated task # " . $taskId . " of user " . $user . " successfully<br/>");
    }
    
    public function touchUser($user)
    {
        $createUser = "INSERT INTO userkeys (UserKey) VALUES ('%s')";
        $createUser = sprintf($createUser, $user);
        $createResult = mysql_query($createUser);
        if($createResult)
        {
            echo("Created user " . $user . "...<br/>");
            
            //add some example tasks to the new user
            $this->createTask($user, "Eat fruits or vegetables", "Food");
            $this->createTask($user, "30 minutes of exercise", "Sport");
            $this->createTask($user, "Talk to a friend", "Social");
            echo("Added some sample-tasks...<br/>");
        }
        else
        {
            echo("User " . $user . " already exists...<br/>");
        }
    }
    
    public function toggleTask($user, $taskId, $date)
    {
        //check if the user has a task with taskId
        $getTaskQuery = "SELECT * FROM tasks, userkeys WHERE TaskId=%d AND UserKey='%s' AND tasks.KeyId=userkeys.KeyId";
        $getTaskQuery = sprintf($getTaskQuery, $taskId, $user);
        $taskResult = mysql_query($getTaskQuery);
        if( !($taskResult && mysql_num_rows($taskResult) != 0))
        {
            echo("User " . $user . " does not have a task #" . $taskId . "<br/>");
            return;
        }
        
        //check if there is an activation for the given day
        echo('Received the following date: ' . $date);
        $getAct = "SELECT ActivationId FROM activations WHERE activations.TaskId=%d AND ActivationDate='%s'";
        $getAct = sprintf($getAct, $taskId, $date);
        $actResult = mysql_query($getAct);
        if($actResult && mysql_num_rows($actResult) != 0)
        {
            //remove the activation if it is already existing (and this way deactivating the task for today)
            $deleteAct = "DELETE FROM activations WHERE ActivationId=%d";
            $deleteAct = sprintf($deleteAct, mysql_result($actResult, 0, 0));
            mysql_query($deleteAct);
            echo("Deactivated task #" . $taskId . ' for ' . $date);
        }
        else
        {
            //create a new Activation if there isn't one yet
            $createAct = "INSERT INTO activations (TaskId, ActivationDate) VALUES (%d, '%s')";
            $createAct = sprintf($createAct, $taskId, $date);
            mysql_query($createAct);
            echo("Activated task #" . $taskId . ' for ' . $date);
        }
    }
}

?>
