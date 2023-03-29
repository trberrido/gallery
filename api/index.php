<?php

$images_configurations = [];
$configuration_index = 0;

$image_folder = './assets/';

while (glob($image_folder . strval($configuration_index) . '_*.*')){

	$images_path = glob($image_folder . strval($configuration_index) . '_*.*');
	$images_length = count($images_path);
	$images_configurations[$configuration_index] = [
		'id'		=> strtoupper(bin2hex(random_bytes(2))),
		'images'	=> []
	];
	$images_index = 0;
	while ($images_index < $images_length){
		$mime_type = explode('/', mime_content_type($images_path[$images_index]))[0];

		if ($mime_type != 'video')
			array_push($images_configurations[$configuration_index]['images'], 'http://' . $_SERVER['HTTP_HOST'] . '/api/assets/' . basename($images_path[$images_index]));
		$images_index += 1;
	}
	$configuration_index += 1;
}

echo json_encode($images_configurations);
exit();