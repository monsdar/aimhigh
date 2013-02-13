<?php

class MysqlConnector
{
    private $isConnected = false;
    
    public function __construct()
    {
        //NOTE: This is just a DB for testing purposes, it does not contain any
        //      valuable data..
        //TODO: For further usage we should implement something which could be configured
        //      by the end-user of this interface...
        //init the MySQL-connection here
        $username = "ks01495db3";
        $password = "aimhigh!!";
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
