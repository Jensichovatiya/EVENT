$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT MetaJson FROM dbo.Tracket_Master_Event WHERE EventId = 1"
$res = $cmd.ExecuteScalar()
$conn.Close()

if ($res -eq $null) {
    write-output "MetaJson is NULL in database!"
} elseif ($res -eq "") {
    write-output "MetaJson is EMPTY string in database!"
} else {
    write-output "MetaJson found!"
    write-output $res
}
