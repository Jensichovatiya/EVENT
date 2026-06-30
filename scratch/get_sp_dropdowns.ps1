$conn = New-Object System.Data.SqlClient.SqlConnection("Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=EVENT_Master;Integrated Security=True;")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT definition FROM sys.sql_modules WHERE object_id = OBJECT_ID('USP_GetEventDropdowns')"
$def = $cmd.ExecuteScalar()
[System.IO.File]::WriteAllText("scratch_sp_geteventdropdowns_full.txt", $def)
$conn.Close()
