<?php
require_once('_cookieRequest.php');

$data['number'] = $_POST['n'];//'2014124082';//
$data['passwd'] = $_POST['p'];
$data['captcha'] = $_POST['c'];//'8475';//
$data['select'] = 'cert_no';
$content = _cookieRequest(VERIFY_URL,$data,true,false);

if(!strpos($content,UNIQUE_CHAR)){
    preg_match_all('/<font\s+color=\"red\">(.*?)<\/font>/', $content, $err);
    $ret['code'] = 0;
    $ret['info'] = $err[1][0];
    
}else{
	$ret['code'] = 1;
	$ret['info'] = 'Access';
}
echo json_encode($ret);
?>