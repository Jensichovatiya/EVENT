$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True;")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT OBJECT_DEFINITION(OBJECT_ID('dbo.USP_AddEditEvent_Full'))"
$def = $cmd.ExecuteScalar()
$def | Out-File -FilePath "d:\EVENT-main\EVENT-main\EVENT-main\db\USP_AddEditEvent_Full.sql" -Encoding utf8
$conn.Close()
Write-Output "Saved successfully."

if need to drop evetid eventd column from zone table then drop it