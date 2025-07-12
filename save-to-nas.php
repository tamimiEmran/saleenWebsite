<?php
// save-to-nas.php - Fixed version for Synology NAS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Set the data file path - same directory as PHP file
$dataFile = __DIR__ . '/app_data.json';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Load data from file
        if (file_exists($dataFile)) {
            $data = file_get_contents($dataFile);
            $jsonData = json_decode($data, true);
            
            if ($jsonData === null) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid JSON in data file'
                ]);
            } else {
                echo json_encode([
                    'success' => true,
                    'data' => $jsonData
                ]);
            }
        } else {
            // Return default data if file doesn't exist
            echo json_encode([
                'success' => true,
                'data' => [
                    'articles' => [],
                    'confessionHistory' => [],
                    'pointsAccumulated' => 0,
                    'concepts' => [
                        "symbols", "metaphors", "narratives", 
                        "marriage as codependency", "emotional disregulation", 
                        "Life as simulation"
                    ]
                ],
                'message' => 'defaults'
            ]);
        }
        break;
        
    case 'POST':
        // Save data to file
        $input = json_decode(file_get_contents('php://input'), true);
        
        if ($input === null) {
            echo json_encode([
                'success' => false,
                'error' => 'Invalid JSON data received'
            ]);
            break;
        }
        
        // Add metadata
        $input['lastSaved'] = date('c');
        $input['savedBy'] = 'Synology NAS';
        
        $jsonString = json_encode($input, JSON_PRETTY_PRINT);
        
        if (file_put_contents($dataFile, $jsonString) !== false) {
            echo json_encode([
                'success' => true,
                'message' => 'Data saved successfully to NAS',
                'timestamp' => date('c'),
                'fileSize' => strlen($jsonString),
                'filePath' => $dataFile
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'Failed to write to data file. Check permissions.'
            ]);
        }
        break;
        
    default:
        echo json_encode([
            'success' => false,
            'error' => 'Method not allowed'
        ]);
        break;
}
?>