$searchText = "GetEventDropdowns"
$searchDir = "d:\EVENT-main\EVENT-main\EVENT-main"

Get-ChildItem -Path $searchDir -Recurse -File | ForEach-Object {
    $file = $_
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        if ($content -match $searchText) {
            Write-Host "Found in: $($file.FullName)"
        }
    } catch {}
}
