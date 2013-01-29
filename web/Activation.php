<?php

class Activation
{
    private $index = 0;
    private $timestamp = 0;
    
    public function __construct($index)
    {
        //use 0 if you do not now which index to put into
        //this is bad design... but there is no such thing
        //as ctor-overloading in PHP (which really is bad design!!)
        $this->index = $index;
        $this->timestamp = time();
    }
    
    public function getIndex()
    {
        return $this->index;
    }
    public function getTimestamp()
    {
        return $this->timestamp;
    }
    public function setTimestamp($timestamp)
    {
        $this->timestamp = $timestamp;
    }
}

?>
