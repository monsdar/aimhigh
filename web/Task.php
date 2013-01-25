<?php

require_once("Activation.php");

class Task
{
    private $index = 0;
    private $text = "";
    private $activations = array();

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
    public function addActivation()
    {
        $this->activations[] = new Activation(0);
    }
}

?>
