Add-Type -AssemblyName System.Drawing

$logoPath = "public\images\splash-tbzb-logo.png"
$logo = [System.Drawing.Bitmap]::FromFile($logoPath)

# Standard Android Adaptive Icon sizes (108dp base):
# mdpi: 108x108 (safe zone ~68px)
# hdpi: 162x162 (safe zone ~102px)
# xhdpi: 216x216 (safe zone ~136px)
# xxhdpi: 324x324 (safe zone ~204px)
# xxxhdpi: 432x432 (safe zone ~272px)
$adaptiveDensities = @(
    @{ Folder = "mipmap-mdpi"; Total = 108; Safe = 68; Legacy = 48 },
    @{ Folder = "mipmap-hdpi"; Total = 162; Safe = 102; Legacy = 72 },
    @{ Folder = "mipmap-xhdpi"; Total = 216; Safe = 136; Legacy = 96 },
    @{ Folder = "mipmap-xxhdpi"; Total = 324; Safe = 204; Legacy = 144 },
    @{ Folder = "mipmap-xxxhdpi"; Total = 432; Safe = 272; Legacy = 192 }
)

foreach ($d in $adaptiveDensities) {
    $folderPath = "android\app\src\main\res\" + $d.Folder
    
    # 1. FOREGROUND for Adaptive Icon:
    # Canvas = $d.Total x $d.Total, Transparent background, Logo scaled to $d.Safe centered
    $fgBmp = New-Object System.Drawing.Bitmap $d.Total, $d.Total
    $fgG = [System.Drawing.Graphics]::FromImage($fgBmp)
    $fgG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $fgG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $fgG.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $fgG.Clear([System.Drawing.Color]::Transparent)
    
    $safeW = $d.Safe
    $safeH = [int]($logo.Height * ($safeW / $logo.Width))
    $fgX = [int](($d.Total - $safeW) / 2)
    $fgY = [int](($d.Total - $safeH) / 2)
    $fgG.DrawImage($logo, $fgX, $fgY, $safeW, $safeH)
    $fgBmp.Save((Join-Path $folderPath "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $fgG.Dispose()
    $fgBmp.Dispose()

    # 2. LEGACY Square Launcher (for older launchers or non-adaptive devices):
    $legBmp = New-Object System.Drawing.Bitmap $d.Legacy, $d.Legacy
    $legG = [System.Drawing.Graphics]::FromImage($legBmp)
    $legG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $legG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $legG.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $legG.FillRectangle($whiteBrush, 0, 0, $d.Legacy, $d.Legacy)
    
    $legLogoW = [int]($d.Legacy * 0.72)
    $legLogoH = [int]($logo.Height * ($legLogoW / $logo.Width))
    $legX = [int](($d.Legacy - $legLogoW) / 2)
    $legY = [int](($d.Legacy - $legLogoH) / 2)
    $legG.DrawImage($logo, $legX, $legY, $legLogoW, $legLogoH)
    $legBmp.Save((Join-Path $folderPath "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $legG.Dispose()
    $legBmp.Dispose()

    # 3. LEGACY Round Launcher:
    $rndBmp = New-Object System.Drawing.Bitmap $d.Legacy, $d.Legacy
    $rndG = [System.Drawing.Graphics]::FromImage($rndBmp)
    $rndG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $rndG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $rndG.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $rndG.Clear([System.Drawing.Color]::Transparent)
    
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $d.Legacy, $d.Legacy)
    $rndG.SetClip($path)
    $rndG.FillRectangle($whiteBrush, 0, 0, $d.Legacy, $d.Legacy)
    $rndG.DrawImage($logo, $legX, $legY, $legLogoW, $legLogoH)
    $rndBmp.Save((Join-Path $folderPath "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $path.Dispose()
    $rndG.Dispose()
    $rndBmp.Dispose()
    $whiteBrush.Dispose()
}

$logo.Dispose()
Write-Output "SUCCESS: Adaptive and Legacy Android Icons generated with official safe-zone margins!"
