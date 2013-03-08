<?php

require_once("ITaskStorage.php");
require_once("Task.php");
require_once("Activation.php");

class MysqlTaskStorage implements ITaskStorage
{
    private $mysql;
    
    public function __construct($mysqlConnector)
    {
        $mysqlConnector = $mysqlConnector;
        $this->mysql = $mysqlConnector->handle();
    }
    
    public function createTask($user, $newTitle, $newText, $category, $isNegative, $offdays)
    {        
        //get the ID of the given user
        $userId = 0;
        $userIdQuery = "SELECT KeyId FROM userkeys WHERE UserKey='%s';";
        $userIdQuery = sprintf($userIdQuery, $user);
        $userIdResult = $this->mysql->query($userIdQuery);
        if( $userIdResult->num_rows != 0 )
        {
            $result = $userIdResult->fetch_object();
            $userId = $result->KeyId;
        }
        else
        {
            //simply return nothing if the user does not exist
            //echo("User " . $user . " does not exist<br/>");
            return;
        }
        
        //add the new task
        $createTaskQuery = "INSERT INTO tasks (KeyId, Category, Title, Text, IsNegative, Offdays) VALUES (%d, '%s', '%s', '%s', %d, %d)";
        $createTaskQuery = sprintf($createTaskQuery, $userId, $category, $newTitle, $newText, $isNegative, $offdays);
        $this->mysql->query($createTaskQuery);
        //echo("New task created successfully<br/>");
    }

    public function deleteTask($user, $taskId)
    {
        //simply delete. If there is no such task, it won't harm...
        //so no checking needed
        //
        //TODO: How to prevent someone just deleting anything with a bruteforce? This would suck...
        $removeTaskQuery = "DELETE tasks FROM tasks,userkeys WHERE TaskId=%d AND tasks.KeyId=userkeys.KeyId AND UserKey='%s'";
        $removeTaskQuery = sprintf($removeTaskQuery, $taskId, $user);
        $this->mysql->query($removeTaskQuery);
        
        //delete all the activations belonging to the given task
        $removeActQuery = "DELETE FROM activations WHERE TaskId=%d;";
        $removeActQuery = sprintf($removeActQuery, $taskId);
        $this->mysql->query($removeActQuery);
        
        echo("Everything deleted without any problems...<br/>");
    }

    public function readTasks($user)
    {
        $allTasks = array();
        $readTasksQuery = "SELECT * FROM tasks, userkeys WHERE tasks.KeyId=userkeys.KeyId AND userkeys.UserKey='%s'";
        $readTasksQuery = sprintf($readTasksQuery, $user);
        $tasksResult = $this->mysql->query($readTasksQuery);
        while($taskRow = $tasksResult->fetch_object() )
        {
            $newTask = new Task();
            $newTask->index = $taskRow->TaskId;
            $newTask->title = $taskRow->Title;
            $newTask->text = $taskRow->Text;
            $newTask->category = $taskRow->Category;
            $newTask->isNegative = $taskRow->IsNegative;
            $newTask->offdays = $taskRow->Offdays;
            
            $readActivations = "SELECT ActivationId, ActivationDate FROM activations WHERE TaskId=%d";
            $readActivations = sprintf($readActivations, $taskRow->TaskId);
            $actResult = $this->mysql->query($readActivations);
            while($actRow = $actResult->fetch_object() )
            {
                $newAct = new Activation();
                $newAct->index = $actRow->ActivationId;
                $newAct->date = $actRow->ActivationDate;
                $newTask->activations[] = $newAct;
            }
            
            $allTasks[] = $newTask;
        }
        return $allTasks;
    }

    public function updateTask($user, $taskId, $newTitle, $newText, $category, $isNegative, $offdays)
    {        
        //Update the given task (do nothing if it does not work... who cares?)
        $updateTask = "UPDATE tasks, userkeys SET Title='%s', Text='%s', Category='%s', IsNegative=%d, Offdays='%s' WHERE TaskId=%d AND tasks.KeyId=userkeys.KeyId AND UserKey='%s'";
        $updateTask = sprintf($updateTask, $newTitle, $newText, $category, $isNegative, $offdays, $taskId, $user);
        $this->mysql->query($updateTask);
        
        echo("Updated task # " . $taskId . " of user " . $user . " successfully<br/>");
    }
    
    public function touchUser($user)
    {
        $createUser = "INSERT INTO userkeys (UserKey) VALUES ('%s')";
        $createUser = sprintf($createUser, $user);
        $createResult = $this->mysql->query($createUser);
        if($createResult)
        {
            //echo("Created user " . $user . "...<br/>");
            
            //add some example tasks to the new user
            $this->createTask($user, "Build your Body", "Exercise often, get fitter, faster and stronger", "Health", false);
            $this->createTask($user, "Eat fruit", "One apple a day keeps the doctor away", "Health", false);
            $this->createTask($user, "Super Size Me", "Eating Fast Food does not help your diet plans", "Health", true);
            
            $this->createTask($user, "I\\'m Positive!", "Click me and see how the Score goes up!", "Introduction", false);
            $this->createTask($user, "I\\'m Negative... ", "I\\'ll decrease the score, so better avoid me", "Introduction", true);
            $this->createTask($user, "Streaky", "Create Streaks by completing tasks several days in a row", "Introduction", false);
            $this->createTask($user, "Change Me", "You can edit tasks with a right mouseclick or long press", "Introduction", false);
            $this->createTask($user, "Categorize", "Tasks can be ordered in categories, try to create a new task", "Introduction", false);
            
            $this->createTask($user, "Procrastination", "You got better things to do than 9Gag and Facebook", "Goals", true);
            $this->createTask($user, "Do it yourself", "Spend some time on your personal projects", "Goals", false);
            $this->createTask($user, "Ping a friend", "Contact someone who you haven\\'t talked to in a while", "Goals", false);
            
            //echo("Added some sample-tasks...<br/>");
            return true;
        }
        else
        {
            //echo("User " . $user . " already exists...<br/>");
            return false;
        }
    }
    
    public function toggleTask($user, $taskId, $date)
    {
        //check if the user has a task with taskId
        $getTaskQuery = "SELECT * FROM tasks, userkeys WHERE TaskId=%d AND UserKey='%s' AND tasks.KeyId=userkeys.KeyId";
        $getTaskQuery = sprintf($getTaskQuery, $taskId, $user);
        $taskResult = $this->mysql->query($getTaskQuery);
        if( !$taskResult || $taskResult->num_rows == 0)
        {
            echo("User " . $user . " does not have a task #" . $taskId . "<br/>");
            return;
        }
        
        //check if there is an activation for the given day
        echo('Received the following date: ' . $date);
        $getAct = "SELECT ActivationId FROM activations WHERE activations.TaskId=%d AND ActivationDate='%s'";
        $getAct = sprintf($getAct, $taskId, $date);
        $actResult = $this->mysql->query($getAct);
        if($actResult && $actResult->num_rows != 0)
        {
            while($actRow = $actResult->fetch_object() )
            {
                //remove the activation if it is already existing (and this way deactivating the task for today)
                $deleteAct = "DELETE FROM activations WHERE ActivationId=%d";
                $deleteAct = sprintf($deleteAct, $actRow->ActivationId);
                $this->mysql->query($deleteAct);
                echo("Deactivated task #" . $taskId . ' for ' . $date);
            }
        }
        else
        {
            //create a new Activation if there isn't one yet
            $createAct = "INSERT INTO activations (TaskId, ActivationDate) VALUES (%d, '%s')";
            $createAct = sprintf($createAct, $taskId, $date);
            $this->mysql->query($createAct);
            echo("Activated task #" . $taskId . ' for ' . $date);
        }
    }
}

?>
