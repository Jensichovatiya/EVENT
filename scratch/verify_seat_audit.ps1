$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT TOP 5 EventId, ZoneId, SeatNumber, RowName, ColumnNo, CreatedBy, UpdatedBy, CreatedFrom, UpdatedFrom, UpdatedDate FROM dbo.Tracket_Master_Event_Zone_Seat WHERE EventId = 20029"
$r = $cmd.ExecuteReader()
write-output "EventId | ZoneId | SeatNumber | CreatedBy | UpdatedBy | CreatedFrom | UpdatedFrom | UpdatedDate"
write-output "------------------------------------------------------------------------------------------------------"
while($r.Read()) {
    write-output ("{0} | {1} | {2} | {3} | {4} | {5} | {6} | {7}" -f $r["EventId"], $r["ZoneId"], $r["SeatNumber"], $r["CreatedBy"], $r["UpdatedBy"], $r["CreatedFrom"], $r["UpdatedFrom"], $r["UpdatedDate"])
}
$conn.Close()
