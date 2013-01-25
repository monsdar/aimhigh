<?php

class Activation
{
    private $index = 0;
    private $timestamp = 0;
    
    public function __construct($index)
    {
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
