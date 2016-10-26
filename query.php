<?php
require_once('_cookieRequest.php');
require_once('database.php');
require_once('functions.php');

$content = _cookieRequest(REDR_INFO_URL,null,false,false);

if(!strpos($content,UNIQUE_CHAR)){
    preg_match_all('/<font\s+color=\"red\">(.*?)<\/font>/', $content, $err);
    $ret['code'] = 0;
    $ret['info'] = $err[1][0];
    
}else{
             
    preg_match_all('/<span\s+class=\"bluetext\">(.*?)<\/span>(.*?)<\/TD>/', $content, $baseInfo);
    //dump($baseInfo);
    
    preg_match_all('/<a\s+href=\"book_lst\.php\">(.*?)<\/a>/', $content, $libInfo);
    $ret['code'] = 1;
    $info['id'] = $baseInfo[2][1];
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

    //数据库初始化相关工作
    mysql_select_db("service", $con);
    mysql_query("set names utf8");
    //mysql_default_chearset('utf8');
    //step1.查找库中是否有该信息
    $query_str1 = "SELECT * FROM `app_library_data` WHERE `id`='$baseInfo[2][1]' LIMIT 1";
    
    $result = mysql_query($query_str1);
    //step2.若无学号信息，则存储借书信息
    if( mysql_fetch_array($result) == false){
        //采集所有图书信息
        $data_para['para_string'] = 'all';
        $origin_content = _cookieRequest(BOOK_HIST_URL,$data_para,false,false);
        //echo $content;
        if(preg_match_all('/<td\s+bgcolor=\"#FFFFFF\"\s+class=\"whitetext\"\s+width=\"(\d)*%\">(.*?)<\/td>/', $origin_content, $tdStr)){
            $count = count($tdStr[0])/7;
            for($i=0;$i<$count;$i++){
                $origin[$i]['b_id'] = $tdStr[2][1+$i*7];
                $origin[$i]['b_name'] = html_entity_decode(strip_tags($tdStr[2][2+$i*7]));
                $origin[$i]['b_author'] = html_entity_decode($tdStr[2][3+$i*7]);
                $origin[$i]['b_borrow_time'] = $tdStr[2][4+$i*7];
                $origin[$i]['b_back_time'] = $tdStr[2][5+$i*7];
                $origin[$i]['b_location'] = $tdStr[2][6+$i*7];
            }
        
            unset($tdStr);
        }
    
        //抓取信息插入数据库
        
        $data_id = addslashes($baseInfo[2][1]);
        $data_name = addslashes($info['name']);
        $data_sex = addslashes($info['sex']);
        $data_college = addslashes($info['college']);
        $data_total = addslashes($info['total']);
        $data_origin_data = addslashes(json_encode($origin));

        $query_str2 = "INSERT INTO app_library_data (`id`, `name`, `sex`, `college`, `total`, `origin_data`)VALUES ('$data_id','$data_name','$data_sex','$data_college','$data_total','$data_origin_data');";
        $result = mysql_query($query_str2);
        //step3.若插入失败，则记录日志以便分析
        //……
        //echo $query_str2;
    }
    
    unset($origin);
    unset($baseInfo);
    unset($info);

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