<?php

$inData = getRequestInfo();

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
if ($conn->connect_error) 
{
    returnWithError($conn->connect_error);
} 
else
{
    $stmt = $conn->prepare("delete from Contacts where FirstName=? and LastName=? and UserID=?");
    $stmt->bind_param("sss", $inData["firstName"],$inData["lastName"], $inData["userId"]);
    $stmt->execute();

    if ($stmt->affected_rows > 0)
    {
        returnWithInfo("Contact deleted successfully");
    }
    else
    {
        returnWithError("Contact not found or permission denied");
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

function returnWithError($err)
{
    $retValue = '{"results":[],"error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithInfo($msg)
{
    $retValue = '{"results":[],"message":"' . $msg . '","error":""}';
    sendResultInfoAsJson($retValue);
}

?>
