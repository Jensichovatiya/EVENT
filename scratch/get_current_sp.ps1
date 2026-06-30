$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT definition FROM sys.sql_modules WHERE object_id = OBJECT_ID('dbo.USP_CreateUpdateBooking')"
$def = $cmd.ExecuteScalar()
if ($def) {
    [System.IO.File]::WriteAllText("scratch/current_sp_def.sql", $def, [System.Text.Encoding]::UTF8)
    Write-Output "Successfully wrote SP definition to scratch/current_sp_def.sql"
} else {
    Write-Output "SP not found in database."
}
$conn.Close()
