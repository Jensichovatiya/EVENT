$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT name, definition FROM sys.triggers t INNER JOIN sys.sql_modules m ON t.object_id = m.object_id WHERE t.parent_id = OBJECT_ID('Tracket_Master_Booking')"
$reader = $cmd.ExecuteReader()
while ($reader.Read()) {
    Write-Output "Trigger Name: $($reader['name'])"
    Write-Output "Definition:"
    Write-Output $reader['definition']
    Write-Output "------------------------"
}
$reader.Close()
$conn.Close()
