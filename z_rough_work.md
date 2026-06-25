\Full project tree excluding folders

Powershell

Get-ChildItem -Directory -Exclude .vscode,dist,node_modules | ForEach-Object {
    tree $_.Name /f
}