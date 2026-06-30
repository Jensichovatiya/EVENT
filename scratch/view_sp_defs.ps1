$connectionString = "Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True"

$sps = @("USP_GetBookings", "USP_CreateUpdateBooking", "USP_CancelBooking")

$conn = New-Object System.Data.SqlClient.SqlConnection($connectionString)
$conn.Open()

foreach ($sp in $sps) {
    $query = "SELECT definition FROM sys.sql_modules WHERE object_id = OBJECT_ID('$sp')"
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $query
    $def = $cmd.ExecuteScalar()
    
    if ($def) {
        $outFile = "d:\EVENT-main\EVENT-main\EVENT-main\scratch\$sp.sql"
        [System.IO.File]::WriteAllText($outFile, $def)
        Write-Host "Exported $sp to $outFile"
    } else {
        Write-Host "Procedure $sp not found or has no definition"
    }
}

$conn.Close()
