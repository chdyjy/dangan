<?php
require_once('config.php');
/**
 * 带COOKIE的访问curl
 * @param $url 访问地址
 * @param bool|array $data 传递的数据
 * @param bool $redirect 是否获取重定向的地址
 * @param bool $isLogin 是否为登录，登录需要保存COOKIE
 * @return mixed 地址或者返回内容
 */
function _cookieRequest($url, $data = null, $redirect = false, $isLogin = false)
{

    $ch = curl_init();
    $params[CURLOPT_URL] = $url;                    //请求url地址
    $params[CURLOPT_HEADER] = false;                //是否返回响应头信息
    $params[CURLOPT_RETURNTRANSFER] = true;         //是否将结果返回
    $params[CURLOPT_FOLLOWLOCATION] = true;         //是否重定向
    $params[CURLOPT_USERAGENT] = 'Mozilla/5.0 (Windows NT 5.1; rv:9.0.1) Gecko/20100101 Firefox/9.0.1';

    if($data)
    {
        $params[CURLOPT_POST] = true;
        $params[CURLOPT_POSTFIELDS] = http_build_query($data);
    }
    
    if (!empty($_COOKIE[COOKIE_NAME]))
    {
    	$cookiePathFile = COOKIE_PATH.$_COOKIE[COOKIE_NAME];
        $params[CURLOPT_COOKIEFILE] = $cookiePathFile;      //这里判断cookie
        if($isLogin){
            $params[CURLOPT_COOKIEJAR] = $cookiePathFile;
        }
    }
    else
    {
    	$cookieFile = tempnam(COOKIE_PATH, '');
    	$cookieFileArray = explode('/',$cookieFile);
        $params[CURLOPT_COOKIEJAR] = $cookieFile;      //写入cookie信息
        setcookie(COOKIE_NAME, end($cookieFileArray), time() + 120);      //保存cookie路径
    }
    curl_setopt_array($ch, $params);                                            //传入curl参数
    $content = curl_exec($ch);
    $headers = curl_getinfo($ch);

    curl_close($ch);
    if ($url != $headers["url"] && $redirect == false)
    {
        return $headers["url"];
    }
    return $content;
}
?>