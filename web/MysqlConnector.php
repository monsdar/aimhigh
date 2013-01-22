<?php

class MysqlConnector
{
    private $isConnected = false;
    
    public function __construct()
    {
        //init the MySQL-connection here
        $username = "ks01495";
        $password = "04ZWSuA7";
        $address = "localhost";
        $database = "ks01495db3";
        mysql_connect($address, $username, $password);
        mysql_select_db($database);
        
        $this->isConnected = true;
    }
    
    public function __destruct()
    {
        //close MySQL-connection here
        mysql_close();
        
        $this->isConnected = false;
    }
    
    public function isConnected()
    {
        return $this->isConnected;
    }
}

?>
