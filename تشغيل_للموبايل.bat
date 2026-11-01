@echo off
chcp 65001 > nul
echo ===================================================
echo     تشغيل سيرفر تطبيق جدول الضرب للبطل محمود
echo ===================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command "& {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet' -and $_.IPAddress -notmatch '^169\.' } | Select-Object -First 1).IPAddress
    $port = 8080
    Write-Host ''
    Write-Host '1. تأكد أن الموبايل متصل بنفس شبكة الواي فاي (WiFi).' -ForegroundColor Yellow
    Write-Host '2. افتح متصفح Chrome أو Safari في موبايل محمود واكتب الرابط التالي:' -ForegroundColor Yellow
    Write-Host ''
    Write-Host ('   http://' + $ip + ':' + $port) -ForegroundColor Green -BackgroundColor Black
    Write-Host ''
    Write-Host '3. من قائمة المتصفح اضغط على: إضافة إلى الشاشة الرئيسية (Add to Home Screen)' -ForegroundColor Cyan
    Write-Host ''
    Write-Host 'السيرفر يعمل الآن... لإيقافه اضغط Ctrl + C' -ForegroundColor Gray
    
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add('http://*:' + $port + '/')
    try {
        $listener.Start()
    } catch {
        # Fallback if admin rights needed for wildcard
        $listener.Prefixes.Clear()
        $listener.Prefixes.Add('http://localhost:' + $port + '/')
        $listener.Start()
    }

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($localPath) -or $localPath -eq '/') {
            $localPath = 'index.html'
        }

        $fullPath = Join-Path $PSScriptRoot $localPath

        if (Test-Path $fullPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $mime = switch ($ext) {
                '.html' { 'text/html; charset=utf-8' }
                '.css'  { 'text/css; charset=utf-8' }
                '.js'   { 'application/javascript; charset=utf-8' }
                '.json' { 'application/json; charset=utf-8' }
                '.png'  { 'image/png' }
                Default { 'application/octet-stream' }
            }
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
}"
pause
