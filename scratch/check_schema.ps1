$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Tracket_Master_Event_Zone_Seat'"
$r = $cmd.ExecuteReader()
while($r.Read()) {
    write-output ("{0} ({1})" -f $r["COLUMN_NAME"], $r["DATA_TYPE"])
}
$conn.Close()
