<?php

require_once("ITaskStorage.php");
require_once("Task.php");
require_once("Activation.php");

class TempTaskStorage implements ITaskStorage
{
    private $tasks = array();
    
    public function createTask($text)
    {
        $newTask = new Task(0);
        $newTask->setText($text);
        
        $this->tasks[] = $newTask;
        
        print("Created new task with text:<br/>" . $newTask->getText());
        print("<br/>");
    }

    public function deleteTask($task)
    {
        foreach( $this->tasks as $key=>$currentTask )
        {
            if( $currentTask->getIndex() == $task->getIndex() )
            {
                unset($this->tasks[$key]);
                $this->tasks = array_values($this->tasks);
                
                print("Removed task with id: " . $task->getIndex());
                print("<br/>");
                return;
            }
        }
        
        print("Cannot remove task with id: " . $task->getIndex() . ", unknown");
        print("<br/>");
    }

    public function readTasks()
    {
        print("Found " . count($this->tasks) . " Tasks...");
        print("<br/>");
        return $this->tasks;
    }

    public function updateTask($task)
    {
        foreach( $this->tasks as $currentTask )
        {
            if( $currentTask->getIndex() == $task->getIndex() )
            {
                $currentTask->setText($task->getText());
                print("Updated task with id: " . $task->getIndex());
                print("<br/>");
                return;
            }
        }
        print("Cannot update task with id: " . $task->getIndex() . ", unknown");
        print("<br/>");
    }
}

?>
