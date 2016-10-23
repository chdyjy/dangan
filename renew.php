<?php
require_once('_cookieRequest.php');

$bar_code = $_GET['bar_code'];
$check = $_GET['check'];
$captcha = $_GET['captcha'];
$time = $_GET['time'];

$renewUrl = 'http://wiscom.chd.edu.cn:8080/reader/ajax_renew.php?bar_code='.$bar_code.'&check='.$check.'&captcha='.$captcha.'&time='.$time;
$content = _cookieRequest($renewUrl,null,false,false);
$ret['code'] = 1;
$ret['info'] = strip_tags($content);
echo json_encode($ret);

?>