$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()

write-output "--- LATEST EVENT ZONES ---"
$cmd.CommandText = "SELECT TOP 5 ZoneId, EventId, ZoneName, Capacity FROM dbo.Tracket_Master_Event_Zone ORDER BY ZoneId DESC"
$r = $cmd.ExecuteReader()
while($r.Read()) {
    write-output ("ZoneId: {0} | EventId: {1} | ZoneName: {2} | Capacity: {3}" -f $r["ZoneId"], $r["EventId"], $r["ZoneName"], $r["Capacity"])
}
$r.Close()

write-output "`n--- LATEST ZONE ASSETS ---"
$cmd.CommandText = "SELECT TOP 10 ZoneAssetId, EventId, ZoneId, AssetId, Quantity, ComponentId, ItemId FROM dbo.Tracket_Master_Event_Zone_Asset ORDER BY ZoneAssetId DESC"
$r = $cmd.ExecuteReader()
while($r.Read()) {
    write-output ("ZoneAssetId: {0} | EventId: {1} | ZoneId: {2} | AssetId: {3} | Qty: {4} | CompId: {5} | ItemId: {6}" -f $r["ZoneAssetId"], $r["EventId"], $r["ZoneId"], $r["AssetId"], $r["Quantity"], $r["ComponentId"], $r["ItemId"])
}
$r.Close()

write-output "`n--- LATEST EVENT ZONE SEATS ---"
$cmd.CommandText = "SELECT TOP 10 SeatId, EventId, ZoneId, SeatNumber, IsBlocked, IsReserved, ZoneAssetId FROM dbo.Tracket_Master_Event_Zone_Seat ORDER BY SeatId DESC"
$r = $cmd.ExecuteReader()
while($r.Read()) {
    write-output ("SeatId: {0} | EventId: {1} | ZoneId: {2} | SeatNo: {3} | Blocked: {4} | Reserved: {5} | ZoneAssetId: {6}" -f $r["SeatId"], $r["EventId"], $r["ZoneId"], $r["SeatNumber"], $r["IsBlocked"], $r["IsReserved"], $r["ZoneAssetId"])
}
$r.Close()

$conn.Close()
