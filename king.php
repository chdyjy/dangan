<?php

require_once('_cookieRequest.php');
require_once('database.php');
require_once('functions.php');

$num = addslashes($_GET['id']);

mysql_select_db("service", $con);
mysql_query("set names utf8");

$query_str1 = "SELECT count(total) FROM `app_library_data`"; 
$query = mysql_query($query_str1);
$result = mysql_fetch_row($query);
$total = $result[0];

$query_str2 = "SELECT total FROM `app_library_data` WHERE id='$num'";
$query = mysql_query($query_str2);
$result = mysql_fetch_row($query);
$mycount = $result[0];
$ret['my'] = $mycount;

$query_str3 = "SELECT count(total) FROM `app_library_data` WHERE `total` <= '$mycount'";
$query = mysql_query($query_str3);
$result = mysql_fetch_row($query);
$now = $result[0];
$total += 0;
$now +=0;

//排名百分比
$ret['per'] = round($now/$total,4) * 100;

if($ret['per'] == 100){
	$nick = 'The King !!!';
}elseif($ret['per']>=95 && $ret['per']<100){
	$nick = '图神';
}elseif($ret['per']>=90 && $ret['per']<95){
	$nick = '图霸';
}elseif($ret['per']>=85 && $ret['per']<90){
	$nick = '图优';
}elseif($ret['per']>=75 && $ret['per']<85){
	$nick = '图良';
}elseif($ret['per']>=60 && $ret['per']<75){
	$nick = '图及格';
}elseif($ret['per']>=40 && $ret['per']<60){
	$nick = '图渣';
}elseif($ret['per']>=10 && $ret['per']<40){
	$nick = '图酥';
}else{
	$nick = '图嗯哼';
}

$ret['nick'] = $nick;

$query_str3 = "SELECT name,college,total  FROM `app_library_data` ORDER BY `total` DESC LIMIT 10";
$query = mysql_query($query_str3);

$rankInfo = array();
while ($row = mysql_fetch_assoc($query)) {
	# code...
	$rankInfo[] = $row;

}
$ret['rank'] = $rankInfo;
echo json_encode($ret);

?>