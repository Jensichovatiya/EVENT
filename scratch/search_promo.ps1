$searchText = "applied successfully"
$searchDir = "d:\EVENT-main\EVENT-main\EVENT-main\EVENT.UI\src"

Get-ChildItem -Path $searchDir -Recurse -File | ForEach-Object {
    $file = $_
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        if ($content -match $searchText) {
            Write-Host "Found in: $($file.FullName)"
            # Print matching lines
            $lines = $content -split "`r?`n"
            for ($i = 0; $i -lt $lines.Length; $i++) {
                if ($lines[$i] -match $searchText) {
                    Write-Host "  Line $($i+1): $($lines[$i].Trim())"
                }
            }
        }
    } catch {}
}
