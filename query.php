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
             
    preg_match_all('/<span\s+class=\"bluetext\">(.*?)<\/span>(.*?)<\/TD>/', $content, $baseInfo);
    //dump($baseInfo);
    
    preg_match_all('/<a\s+href=\"book_lst\.php\">(.*?)<\/a>/', $content, $libInfo);
    $ret['code'] = 1;
    //[0] => string(9) "姓名：",[1] => string(13) "证件号："
    $info['name'] = $baseInfo[2][0];
    //[19] => string(9) "性别："
    $info['sex'] = $baseInfo[2][19];
    //[16] => string(15) "工作单位："
    $info['college'] = $baseInfo[2][16];
    //[11] => string(15) "累计借书："
    $info['total'] = $baseInfo[2][11];

    //[0] => string(67) "五天内即将过期图书[<strong style="color:#F00;">0</strong>]"
    preg_match_all('/>(\d)*</', $libInfo[0][1], $matchNum1);
    $info['expiring'] = $matchNum1[1][0];

    //[1] => string(55) "已超期图书[<strong style="color:#F00;">0</strong>]"
    preg_match_all('/>(\d)*</', $libInfo[1][1], $matchNum2);
    $info['expired'] = $matchNum2[1][0];

    $ret['info'] = $info;
    
    $content = _cookieRequest(CURRENT_URL,null,false);
    if(preg_match_all('/<td\s+class=\"whitetext\"\s+width=\"(\d)*%\">(.*?)<\/td>/', $content, $tdStr)){
        //dump($tdStr);
        //借书数量
        preg_match_all('/getInLib\((.*?)\)/', $content, $extraStr);
        $count = count($tdStr[1])/5;
        //dump($extraStr);
        for ($i=0; $i < $count; $i++) { 
            preg_match_all('/>(.*?)</', $tdStr[2][1+$i*5], $book);
            $bookInfo[$i]['bookName'] = $book[1][0];
            $bookInfo[$i]['borrowed'] = $tdStr[2][2+$i*5];
            preg_match_all('/>(.*)?</', $tdStr[2][3+$i*5], $back);
            $bookInfo[$i]['back'] = rtrim($back[1][0]);
            $bookInfo[$i]['id'] = $tdStr[2][0+$i*5];

            //计算check值
            $check = explode("'",$extraStr[1][$i]);
            $bookInfo[$i]['check'] = $check[3];

        }
        $ret['book'] = $bookInfo;
    }
}
echo json_encode($ret);

?>