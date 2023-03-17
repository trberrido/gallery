<?php

$images_configurations = [];
$configuration_index = 0;

$image_folder = '../images/';

while (glob($image_folder . strval($configuration_index) . '_*.*')){

	$images_path = glob($image_folder . strval($configuration_index) . '_*.*');
	$images_length = count($images_path);
	$images_configurations[$configuration_index] = [];
	$images_index = 0;
	while ($images_index < $images_length){
		$mime_type = explode('/', mime_content_type($images_path[$images_index]))[0];
		if ($mime_type != 'video')
			array_push($images_configurations[$configuration_index], $images_path[$images_index]);
		$images_index += 1;
	}
	$configuration_index += 1;
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($images_configurations);