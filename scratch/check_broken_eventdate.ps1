$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()
$cmd = $conn.CreateCommand()
# Find SPs that reference S.EventDate or Slot.EventDate - the actual broken pattern
$cmd.CommandText = @"
SELECT 
    OBJECT_NAME(o.object_id) AS SPName
FROM sys.sql_modules sm
INNER JOIN sys.objects o ON sm.object_id = o.object_id
WHERE o.type = 'P'
AND (sm.definition LIKE '%S.EventDate%' OR sm.definition LIKE '%Slot.EventDate%' OR sm.definition LIKE '%BD.EventDate%')
"@
$reader = $cmd.ExecuteReader()
$found = $false
while($reader.Read()) { Write-Output ("BROKEN SP: " + $reader[0]); $found = $true }
if (-not $found) { Write-Output "No other broken SPs found." }
$conn.Close()
