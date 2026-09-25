# Lightweight PowerShell HTTP Static Server for Local Testing
$port = 5500
$path = "c:\Users\gopir\siri"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "SAVIOUR Dev Server running at http://localhost:$port/"

try {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $localPath = $request.Url.LocalPath
            if ($localPath -eq "/" -or $localPath -eq "") {
                $localPath = "/index.html"
            }

            # Normalize path
            $relPath = $localPath.TrimStart('/').Replace('/', '\')
            $filePath = Join-Path $path $relPath

            if (Test-Path $filePath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                
                # Content types
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                switch ($ext) {
                    ".html" { $response.ContentType = "text/html; charset=utf-8" }
                    ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                    ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                    ".json" { $response.ContentType = "application/json; charset=utf-8" }
                    ".svg"  { $response.ContentType = "image/svg+xml" }
                    ".png"  { $response.ContentType = "image/png" }
                    ".jpg"  { $response.ContentType = "image/jpeg" }
                    default { $response.ContentType = "application/octet-stream" }
                }
                # CORS headers MUST be set before ContentLength64
                $response.AppendHeader("Access-Control-Allow-Origin", "*")
                $response.AppendHeader("Cache-Control", "no-cache")
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                $response.OutputStream.Flush()
            } else {
                $response.StatusCode = 404
                $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
                $response.ContentType = "text/plain; charset=utf-8"
                $response.ContentLength64 = $msg.Length
                $response.OutputStream.Write($msg, 0, $msg.Length)
                $response.OutputStream.Flush()
            }
            $response.Close()
        } catch {
            Write-Host "Request handling error: $_"
            try { $response.Close() } catch {}
        }
    }
} finally {
    $listener.Stop()
}
