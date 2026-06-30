$connectionString = "Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True"
$query = @"
SELECT V.ValueId, V.CategoryId, C.DDL_ID, V.Description, V.AdditionalField, V.IsActive
FROM Tracket_Master_GeneralMasterValue V
INNER JOIN Tracket_Master_GeneralMasterCategory C ON V.CategoryId = C.CategoryId
WHERE C.DDL_ID = 'BOOKING_STATUS'
ORDER BY V.AdditionalField;
"@

$conn = New-Object System.Data.SqlClient.SqlConnection($connectionString)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = $query
$adapter = New-Object System.Data.SqlClient.SqlDataAdapter($cmd)
$dt = New-Object System.Data.DataTable
$adapter.Fill($dt) | Out-Null
$dt | Format-Table
$conn.Close()
