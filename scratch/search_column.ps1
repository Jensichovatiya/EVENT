$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = @"
SELECT 
    t.name AS TableName, 
    c.name AS ColumnName 
FROM sys.columns c
INNER JOIN sys.tables t ON c.object_id = t.object_id
WHERE c.name = 'EventDate';
"@
$reader = $cmd.ExecuteReader()
while ($reader.Read()) {
    Write-Output "Table: $($reader['TableName']) | Column: $($reader['ColumnName'])"
}
$reader.Close()

# Also search triggers
$cmd.CommandText = @"
SELECT 
    o.name AS TriggerName,
    m.definition AS TriggerDefinition
FROM sys.sql_modules m
INNER JOIN sys.objects o ON m.object_id = o.object_id
WHERE o.type = 'TR' AND m.definition LIKE '%EventDate%';
"@
$reader2 = $cmd.ExecuteReader()
while ($reader2.Read()) {
    Write-Output "Trigger: $($reader2['TriggerName'])"
}
$reader2.Close()

$conn.Close()
