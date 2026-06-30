$sqlFile = "d:\EVENT-main\EVENT-main\EVENT-main\scratch\USP_CreateUpdateBooking.sql"
$connectionString = "Server=(localdb)\MSSQLLocalDB;Database=EVENT_Master;Integrated Security=True"

write-output "Reading SQL file: $sqlFile"
$content = [System.IO.File]::ReadAllText($sqlFile)

# Split by GO statement on its own line (case-insensitive)
$batches = [System.Text.RegularExpressions.Regex]::Split($content, "(?mi)^\s*GO\s*$")

write-output ("Found {0} batches to execute." -f $batches.Count)

$conn = New-Object System.Data.SqlClient.SqlConnection($connectionString)
$conn.Open()

$batchIndex = 1
foreach ($batch in $batches) {
    $cleanBatch = $batch.Trim()
    if ($cleanBatch -eq "") {
        continue
    }
    
    try {
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = $cleanBatch
        $cmd.ExecuteNonQuery() > $null
        write-output ("Batch {0}/{1} executed successfully." -f $batchIndex, $batches.Count)
    } catch {
        write-error ("Error executing Batch {0}: {1}" -f $batchIndex, $_.Exception.Message)
        # Output snippet of the failing batch
        $lines = $cleanBatch -split "`n"
        $snippet = ($lines[0..[Math]::Min(5, $lines.Count-1)]) -join "`n"
        write-output "Failing SQL snippet:"
        write-output $snippet
        break
    }
    $batchIndex++
}

$conn.Close()
write-output "Finished executing SQL script."
