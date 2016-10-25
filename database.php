<?php
define(DB_HOST_NAME, 'localhost');
define(DB_DATABASE, 'service');
define(DB_USR, 'root');
define(DB_PWD, '69431589');
$con = mysql_connect('localhost',DB_USR,DB_PWD);
if (!$con)
{
  die('Could not connect: ' . mysql_error());
}


?>