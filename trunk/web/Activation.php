<?php

class Activation
{
    //These are public to be able to use json_encode
    //By design, they shouldn't be accessed directly (that's what Getter/Setter are for!!)
    //TODO: This is a bad architecture and we certainly should keep up with something better in the future...
    public $index = 0;
    public $timestamp = 0;
    
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
