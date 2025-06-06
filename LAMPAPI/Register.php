<?php

  $inData = getRequestInfo();

  $msg = "";

  $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
  if ($conn->connect_error)
  {
    returnWithError($conn->connect_error);
  }
  else
  {
    // Check if username already exists
    $stmt = $conn->prepare("SELECT ID FROM Users WHERE Login = ?");
    $stmt->bind_param("s", $inData["login"]);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0)
    {
      returnWithError("Username already taken", 409);
    }
    else
    {
      // Insert new user
      $stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)");
      $stmt->bind_param("ssss", $inData["firstName"], $inData["lastName"], $inData["login"], $inData["password"]);
      
      if ($stmt->execute())
      {
        returnWithInfo("User registered successfully");
      }
      else
      {
        returnWithError("Failed to register user");
      }
    }

    $stmt->close();
    $conn->close();
  }

  function getRequestInfo()
  {
    return json_decode(file_get_contents('php://input'), true);
  }

  function sendResultInfoAsJson($obj)
  {
    header('Content-type: application/json');
    echo $obj;
  }

  function returnWithError($err, $statusCode = 400)
  {
    http_response_code($statusCode);
    $retValue = '{"message":"' . $msg . '","error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
  }

  function returnWithInfo($msg)
  {
    $retValue = '{"message":"' . $msg . '","error":""}';
    sendResultInfoAsJson($retValue);
  }

?>
