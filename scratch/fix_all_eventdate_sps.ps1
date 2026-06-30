$conn = New-Object System.Data.SqlClient.SqlConnection("Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True")
$conn.Open()

# Get all broken SP definitions and fix them
$getSPsCmd = $conn.CreateCommand()
$getSPsCmd.CommandText = @"
SELECT 
    OBJECT_NAME(o.object_id) AS SPName,
    sm.definition
FROM sys.sql_modules sm
INNER JOIN sys.objects o ON sm.object_id = o.object_id
WHERE o.type = 'P'
AND (sm.definition LIKE '%S.EventDate%' OR sm.definition LIKE '%Slot.EventDate%' OR sm.definition LIKE '%BD.EventDate%')
"@

$reader = $getSPsCmd.ExecuteReader()
$spList = @()
while ($reader.Read()) {
    $spList += @{ Name = $reader[0]; Definition = $reader[1] }
}
$reader.Close()

$fixCount = 0
foreach ($sp in $spList) {
    $name = $sp.Name
    $def  = $sp.Definition

    # Replace broken column references with the correct column name
    $fixed = $def `
        -replace 'S\.EventDate', 'S.StartDate' `
        -replace 'Slot\.EventDate', 'Slot.StartDate' `
        -replace 'BD\.EventDate', 'BD.EventDate'   # BD.EventDate is fine (Booking_Date table)

    # Convert CREATE -> ALTER so we can update it
    # The sys.sql_modules definition includes the full text starting with CREATE
    $fixed = [regex]::Replace($fixed, 'CREATE\s+PROCEDURE', 'ALTER PROCEDURE', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $fixed = [regex]::Replace($fixed, 'CREATE\s+PROC\b', 'ALTER PROC', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

    try {
        $alterCmd = $conn.CreateCommand()
        $alterCmd.CommandText = $fixed
        $alterCmd.ExecuteNonQuery() | Out-Null
        Write-Output "FIXED: $name"
        $fixCount++
    } catch {
        Write-Output "ERROR fixing $name`: $_"
    }
}

Write-Output ""
Write-Output "Done. Fixed $fixCount stored procedure(s)."
$conn.Close()
