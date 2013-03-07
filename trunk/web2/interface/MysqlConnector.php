<?php

class MysqlConnector
{
    private $isConnected = false;
    private $mysqlHandle = 0;
    
    public function __construct()
    {
        //NOTE: This is just a DB for testing purposes, it does not contain any
        //      valuable data..
        //TODO: For further usage we should implement something which could be configured
        //      by the end-user of this interface...
        //init the MySQL-connection here
        $username = "ks01495db3";
        $password = "SqlAimhigh!!";
        $address = "localhost";
        $database = "ks01495db3";
        $this->mysqlHandle = @new mysqli($address, $username, $password, $database);
        
        if(mysqli_connect_errno() != 0)
        {
            echo "Failed to connect to MySQL: " . mysqli_connect_error();
        }
        
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
    
    public function handle()
    {
        return $this->mysqlHandle;
    }
}

?>
