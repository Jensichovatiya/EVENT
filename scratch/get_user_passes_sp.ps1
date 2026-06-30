$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT OBJECT_DEFINITION(OBJECT_ID('USP_GetUserPasses'))"
$result = $cmd.ExecuteScalar()
$conn.Close()
Write-Output $result
