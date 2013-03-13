<?php

require_once("ITaskStorage.php");
require_once("Task.php");
require_once("Activation.php");

require_once('rb.php');

class RedbeanTaskStorage implements ITaskStorage
{    
    private $connection = 0;
    
    public function __construct()
    {
        try
        {
            $this->connection = R::setup('mysql:host=localhost;dbname=ks01495db5','ks01495db5','SqlAimhigh!!'); 
            R::$adapter->getDatabase()->connect();
        }
        catch(PDOException $e)
        {
            //TODO: What to do in that case?
            echo("Not connected to DB<br/>");
        }
        
        //Prohibit Database changes from RedBean
        // -> the DB has to be set up beforehand
        R::freeze(true);
        
        //This defines that if a task is removed, all its activations will also
        //be removed. The same for a user and his tasks
        R::dependencies(array('task'=>array('user'),'activation'=>array('task')));
    }
    
    public function __destruct()
    {
        //disconnect from the DB
        R::close();
    }
    
    public function createTask($user, $newTitle, $newText, $category, $isNegative, $offdays)
    {
        //search for the user
        $givenUser = R::findOne('user', 'userkey = ?', array( $user ));
        if(!$givenUser)
        {
            return;
        }
        
        //add the new task to the users tasks
        $task = R::dispense('task');
        $task->title = $newTitle;
        $task->text = $newText;
        $task->category = $category;
        $task->isnegative = $isNegative;
        $task->offdays = $offdays;
        $givenUser->ownTask[] = $task;
        
        //store it
        $id = R::store($givenUser);
    }

    public function deleteTask($user, $taskId)
    {
        //search for the user
        $givenUser = R::findOne('user', 'userkey = ?', array( $user ));
        if(!$givenUser)
        {
            return;
        }
        
        //delete the task, remove it from the user
        unset($givenUser->ownTask[$taskId]);
        R::store($givenUser);
        
        //NOTE: Activations will be automatically removed due to
        //the dependencies defined in the ctor
    }

    public function readTasks($user)
    {        
        //search for the user
        $givenUser = R::findOne('user', 'userkey = ?', array( $user ));
        if(!$givenUser)
        {
            return;
        }
        
        //put the users tasks and it's activations into a JSONable-object
        $allTasks = array();
        foreach($givenUser->ownTask as $task)
        {
            $newTask = new Task();
            $newTask->index = $task->id;
            $newTask->title = $task->title;
            $newTask->text = $task->text;
            $newTask->category = $task->category;
            $newTask->isNegative = $task->isnegative;
            $newTask->offdays = $task->offdays;
        
            //read the activations
            foreach($task->ownActivation as $activation)
            {
                $newAct = new Activation();
                $newAct->index = $activation->id;
                $newAct->date = $activation->date;
                $newTask->activations[] = $newAct;
            }
            
            $allTasks[] = $newTask;
        }
        
        return $allTasks;
    }

    public function updateTask($user, $taskId, $newTitle, $newText, $category, $isNegative, $offdays)
    {
        //search for the user
        $givenUser = R::findOne('user', 'userkey = ?', array( $user ));
        if(!$givenUser)
        {
            return;
        }
        
        //get the task
        $givenUser->ownTask[$taskId]->title = $newTitle;
        $givenUser->ownTask[$taskId]->text = $newText;
        $givenUser->ownTask[$taskId]->category = $category;
        $givenUser->ownTask[$taskId]->isnegative = $isNegative;
        $givenUser->ownTask[$taskId]->offdays = $offdays;
        
        //store everything
        R::store($givenUser);
    }
    
    public function touchUser($user)
    {        
        //search for the user
        $givenUser = R::findOne('user', ' userkey = ? ', array( $user ));
        if(!$givenUser)
        {
            //add him if he does not exist yet
            $newUser = R::dispense('user');
            $newUser->userkey = $user;
            R::store($newUser);
            
            //add some example tasks to the new user
            $this->createTask($user, "Build your Body", "Exercise often, get fitter, faster and stronger", "Health", false, "MONDAY,TUESDAY");
            $this->createTask($user, "Eat fruit", "One apple a day keeps the doctor away", "Health", false, "WEDNESDAY,SATURDAY,SUNDAY");
            $this->createTask($user, "Super Size Me", "Eating Fast Food does not help your diet plans", "Health", true, "THURSDAY,FRIDAY");
            
            $this->createTask($user, "I'm Positive!", "Click me and see how the Score goes up!", "Introduction", false, "");
            $this->createTask($user, "I'm Negative... ", "I'll decrease the score, so better avoid me", "Introduction", true, "");
            $this->createTask($user, "Streaky", "Create Streaks by completing tasks several days in a row", "Introduction", false, "");
            $this->createTask($user, "Change Me", "You can edit tasks with a right mouseclick or long press", "Introduction", false, "");
            $this->createTask($user, "Categorize", "Tasks can be ordered in categories, try to create a new task", "Introduction", false, "");
            
            $this->createTask($user, "Procrastination", "You got better things to do than 9Gag and Facebook", "Goals", true, "");
            $this->createTask($user, "Do it yourself", "Spend some time on your personal projects", "Goals", false, "");
            $this->createTask($user, "Ping a friend", "Contact someone who you haven't talked to in a while", "Goals", false, "");
            
            return true;
        }
        
        //if the user has been found, simply return false
        //this indicates that this is no new user
        return false;
    }
    
    public function toggleTask($user, $taskId, $date)
    {
        //search for the user
        $givenUser = R::findOne('user', 'userkey = ?', array( $user ));
        if(!$givenUser)
        {
            //echo("User " . $user . " does not exist<br/>");
            return;
        }
        
        //check if a task with the given id exists
        if( !array_key_exists($taskId, $givenUser->ownTask) )
        {
            //echo("User " . $user . " does not have a task #" . $taskId . "<br/>");
            return;
        }
        
        //check for an activation at the given day
        $act = R::findOne('activation', 'date=? AND task_id=?', array($date, $taskId));
        if($act)
        {
            //if the activation exists, remove it
            R::trash($act);
            echo("Deactivated task #" . $taskId . ' for ' . $date . "<br/>");
        }
        else
        {
            //if there is no such activation, create one
            $newAct = R::dispense('activation');
            $newAct->date = $date;
            $givenUser->ownTask[$taskId]->ownActivation[] = $newAct;
            R::store($givenUser);
            
            echo("Activated task #" . $taskId . ' for ' . $date . "<br/>");
        }
    }
}

?>
