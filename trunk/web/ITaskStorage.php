<?php

require_once("Task.php");
require_once("Activation.php");

interface ITaskStorage
{
    //creates a new task with the given text
    public function createTask($user, $newText);
    
    //reads all the tasks from database, returns them in an array
    public function readTasks($user);
    
    //writes the given task to the DB
    public function updateTask($user, $taskId, $newText);
    
    //removes the given task from the DB
    public function deleteTask($user, $taskId);
}

?>
