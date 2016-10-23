<?php
require_once('_cookieRequest.php');

$result = _cookieRequest(LOGIN_URL,null,true,true);
if($result){
    $img = _cookieRequest(CAPTCHA_URL, null, true, false);
}
header('Content-type: image/gif');
echo $img;
?>