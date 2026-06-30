$searchFile = "d:\EVENT-main\EVENT-main\EVENT-main\EVENT.UI\src\components\Booking.tsx"
$lines = [System.IO.File]::ReadAllLines($searchFile)

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match "promoApplied" -or $line -match "discount") {
        Write-Host "Line $($i+1): $($line.Trim())"
    }
}
