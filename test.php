<?php
require_once('_cookieRequest.php');
require_once('database.php');

/*
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
$origin_data = json_encode($origin);
print_r($origin_data);
*/
//数据库初始化相关工作
    mysql_select_db("service", $con);
    //step1.查找库中是否有该信息
    $query_str1 = "SELECT * FROM `app_library_data` WHERE `id`='2014124082' LIMIT 1";
    
    $result = mysql_query($query_str1);
    $row = mysql_fetch_array($result);
    
    if($row== false){
        //采集所有图书信息
        $data_para['para_string'] = 'all';
        $origin_content = _cookieRequest(BOOK_HIST_URL,$data_para,false,false);
        echo $content;
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
       	$baseInfo[2][1] = '2014124082';
    	$info['name'] = 'afsd';
    	$info['sex'] = 'aaa';
    	$info['college'] = 'total';
    	$info['total'] = '1234';
        //抓取信息插入数据库
        $data_id = addslashes($baseInfo[2][1]);
        $data_name = addslashes($info['name']);
        $data_sex = addslashes($info['sex']);
        $data_college = addslashes($info['college']);
        $data_total = addslashes($info['total']);
        $data_origin_data = addslashes(json_encode($origin));

        $query_str2 = "INSERT INTO app_library_data (`id`, `name`, `sex`, `college`, `total`, `origin_data`)VALUES ('$data_id','$data_name','$data_sex','$data_college','$data_total','$data_origin_data');";
        
        $result = mysql_query($query_str2);
        var_dump($result);
        echo $query_str2;
    }else{
    	echo '****';
    }



?>