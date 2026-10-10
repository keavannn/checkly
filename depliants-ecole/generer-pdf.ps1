# Génère les deux dépliants en PDF (A4 paysage, recto-verso) avec Chrome.
# Usage : pwsh -File generer-pdf.ps1
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$ici = $PSScriptRoot
$pages = @{ "cataracte" = "Depliant-Cataracte.pdf"; "otite" = "Depliant-Otite.pdf" }

foreach ($nom in $pages.Keys) {
  $source = "file:///" + ((Join-Path $ici "src\$nom.html") -replace '\\', '/')
  $sortie = Join-Path $ici $pages[$nom]
  & $chrome --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=10000 `
    --print-to-pdf="$sortie" $source 2>$null | Out-Null
  Write-Output "$($pages[$nom]) : $((Get-Item $sortie).Length) octets"
}
