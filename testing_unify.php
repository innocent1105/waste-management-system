<?php

$curl = curl_init();

curl_setopt_array($curl, array(
   CURLOPT_URL => 'https://api.moneyunify.one/payments/verify',
   CURLOPT_RETURNTRANSFER => true,
   CURLOPT_ENCODING => '',
   CURLOPT_MAXREDIRS => 10,
   CURLOPT_TIMEOUT => 0,
   CURLOPT_FOLLOWLOCATION => true,
   CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
   CURLOPT_CUSTOMREQUEST => 'POST',
   CURLOPT_POSTFIELDS => 'auth_id=01KHX5G65YRTA5TQNZM3YCP1FY&transaction_id=LPLXC-20260220-145422-521-8495',
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;