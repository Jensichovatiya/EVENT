$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT TOP 5 EventId, EventName, slug FROM dbo.Tracket_Master_Event WHERE IsDeleted = 0 ORDER BY EventId DESC"
$r = $cmd.ExecuteReader()
write-output "EventId | EventName | Slug"
write-output "---------------------------------------"
while($r.Read()) {
    write-output ("{0} | {1} | {2}" -f $r["EventId"], $r["EventName"], $r["slug"])
}
$r.Close()

$cmd.CommandText = "SELECT ZoneId, EventId, ZoneName, Capacity FROM dbo.Tracket_Master_Event_Zone WHERE IsDeleted = 0"
$r2 = $cmd.ExecuteReader()
write-output "`nZoneId | EventId | ZoneName | Capacity"
write-output "---------------------------------------"
while($r2.Read()) {
    write-output ("{0} | {1} | {2} | {3}" -f $r2["ZoneId"], $r2["EventId"], $r2["ZoneName"], $r2["Capacity"])
}
$conn.Close()
