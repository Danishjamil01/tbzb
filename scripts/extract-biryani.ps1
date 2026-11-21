Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\danis\.gemini\antigravity\brain\fb6ad9f1-3e61-45ac-a7df-8ff2d253676c\.user_uploaded\media_1795191110915_e8f022f3.jpg"
$destPath = "D:\tbzb-web\public\images\food\splash-biryani.png"

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = 490
$height = 250
$cropped = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $height; $y++) {
    $srcY = $y + 670
    for ($x = 0; $x -lt $width; $x++) {
        $srcX = $x + 40
        $c = $src.GetPixel($srcX, $srcY)
        
        $isGreenWave = ($c.G -gt 45 -and $c.R -lt 70 -and $c.B -lt 60)
        $isYellowWave = ($srcY -gt 870 -and $c.R -gt 220 -and $c.G -gt 160 -and $c.B -lt 50 -and ($srcX -lt 120 -or $srcX -gt 410))
        
        $bgDist = [Math]::Sqrt([Math]::Pow(253 - $c.R, 2) + [Math]::Pow(249 - $c.G, 2) + [Math]::Pow(248 - $c.B, 2))
        
        if ($isGreenWave -or $isYellowWave -or $bgDist -lt 14) {
            $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } elseif ($bgDist -lt 28) {
            $alpha = [int](($bgDist - 14) / 14 * 255)
            $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
        } else {
            $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
        }
    }
}

$cropped.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$cropped.Dispose()
$src.Dispose()

Write-Output "Extracted splash biryani PNG successfully."

