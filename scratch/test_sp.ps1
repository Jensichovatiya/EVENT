$conn = New-Object System.Data.SqlClient.SqlConnection("Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=EVENT_Master;Integrated Security=True;")
$cmd = New-Object System.Data.SqlClient.SqlCommand("USP_GetEventDropdowns", $conn)
$cmd.CommandType = [System.Data.CommandType]::StoredProcedure
$da = New-Object System.Data.SqlClient.SqlDataAdapter($cmd)
$ds = New-Object System.Data.DataSet
$da.Fill($ds)
for ($i=0; $i -lt $ds.Tables.Count; $i++) {
    $cols = ($ds.Tables[$i].Columns | foreach {$_.ColumnName}) -join ", "
    Write-Output "Table $i - Columns: $cols (Rows: $($ds.Tables[$i].Rows.Count))"
}
