$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()

$tables = @("Tracket_Master_Booking_Date", "Tracket_Master_Booking", "Tracket_Master_Event_Slot", "Tracket_Master_Booking_Attendee")

foreach ($t in $tables) {
    Write-Output "--- Columns for $t ---"
    $cmd.CommandText = "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$t'"
    $reader = $cmd.ExecuteReader()
    while ($reader.Read()) {
        Write-Output "$($reader['COLUMN_NAME']) ($($reader['DATA_TYPE']))"
    }
    $reader.Close()
}

$conn.Close()
