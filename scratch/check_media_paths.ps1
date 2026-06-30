$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()

write-output "--- EVENT MEDIA PATHS ---"
$cmd.CommandText = "SELECT EventId, ThumbnailImage, BannerImage FROM dbo.Tracket_Master_Event WHERE EventId = 1"
$r = $cmd.ExecuteReader()
while($r.Read()) {
    write-output ("EventId: {0}`nThumbnailImage: {1}`nBannerImage: {2}" -f $r["EventId"], $r["ThumbnailImage"], $r["BannerImage"])
}
$r.Close()

write-output "`n--- EVENT DOCUMENTS PATHS ---"
$cmd.CommandText = "SELECT DocumentId, FileName, FilePath FROM dbo.Tracket_Master_Event_Document WHERE EventId = 1"
$r = $cmd.ExecuteReader()
while($r.Read()) {
    write-output ("DocumentId: {0} | Name: {1} | Path: {2}" -f $r["DocumentId"], $r["FileName"], $r["FilePath"])
}
$r.Close()

$conn.Close()
