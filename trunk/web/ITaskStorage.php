<?php

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
    
    //Checks if a user exists. If not, the user will be created
    public function touchUser($user);
    
    //de/activates a task
    public function toggleTask($user, $taskId, $date);
}

?>
