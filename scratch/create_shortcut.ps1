$WshShell = New-Object -ComObject WScript.Shell
$StartupPath = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Startup\start_sync.lnk"
$Shortcut = $WshShell.CreateShortcut($StartupPath)
$Shortcut.TargetPath = "D:\ERP\ERP\start_sync.bat"
$Shortcut.WorkingDirectory = "D:\ERP\ERP"
$Shortcut.Save()
Write-Host "✅ Shortcut successfully created at: $StartupPath"
