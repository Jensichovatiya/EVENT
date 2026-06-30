$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT AssetId, AssetName, AssetCode, AvailableQty FROM dbo.Tracket_Master_Asset WHERE IsDeleted = 0"
$r = $cmd.ExecuteReader()
write-output "AssetId | AssetName | AssetCode | AvailableQty"
write-output "---------------------------------------------"
while($r.Read()) {
    write-output ("{0} | {1} | {2} | {3}" -f $r["AssetId"], $r["AssetName"], $r["AssetCode"], $r["AvailableQty"])
}
$conn.Close()
