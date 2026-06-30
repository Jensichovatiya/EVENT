$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = @"
SELECT 
    OBJECT_NAME(o.object_id) AS SPName,
    sm.definition
FROM sys.sql_modules sm
INNER JOIN sys.objects o ON sm.object_id = o.object_id
WHERE o.type = 'P'
AND sm.definition LIKE '%EventDate%'
"@
$reader = $cmd.ExecuteReader()
while($reader.Read()) { Write-Output ("SP: " + $reader[0]) }
$conn.Close()
