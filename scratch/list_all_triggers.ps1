$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = @"
SELECT 
    t.name AS TriggerName,
    parent.name AS TableName,
    m.definition AS TriggerDefinition
FROM sys.triggers t
INNER JOIN sys.objects parent ON t.parent_id = parent.object_id
INNER JOIN sys.sql_modules m ON t.object_id = m.object_id
"@
$reader = $cmd.ExecuteReader()
while ($reader.Read()) {
    Write-Output "Trigger: $($reader['TriggerName']) on Table: $($reader['TableName'])"
    Write-Output "Definition:"
    Write-Output $reader['TriggerDefinition']
    Write-Output "------------------------"
}
$reader.Close()
$conn.Close()
