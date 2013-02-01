<?php

require_once("Activation.php");

class Task
{
    //These are public to be able to use json_encode
    //By design, they shouldn't be accessed directly (that's what Getter/Setter are for!!)
    //TODO: This is a bad architecture and we certainly should keep up with something better in the future...
    public $index = 0;
    public $text = "";
    public $activations = array();

    public function __construct($index)
    {
        $this->index = $index;
    }
    
    public function getIndex()
    {
        return $this->index;
    }
    public function setText($text)
    {
        $this->text = $text;
    }
    public function getText()
    {
        return $this->text;
    }
    public function getActivations()
    {
        return $this->activations;
    }
    public function activate()
    {
        $this->activations[] = new Activation(0);
    }
    public function addActivation($activation)
    {
        $this->activations[] = $activation;
    }
}

?>
