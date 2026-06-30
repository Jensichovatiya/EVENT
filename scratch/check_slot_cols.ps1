$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Tracket_Master_Event_Slot' ORDER BY ORDINAL_POSITION"
$reader = $cmd.ExecuteReader()
while($reader.Read()) { Write-Output $reader[0] }
$conn.Close()
