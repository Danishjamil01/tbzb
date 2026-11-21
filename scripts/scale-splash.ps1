Add-Type -AssemblyName System.Drawing

function Scale-Splash($srcPath, $dstPath, $w, $h) {
    $dir = Split-Path $dstPath
    if (!(Test-Path $dir)) { 
        New-Item -ItemType Directory -Path $dir -Force | Out-Null 
    }
    
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Fill background with ivory cream #FAF8F5
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 248, 245))
    $g.FillRectangle($brush, 0, 0, $w, $h)
    
    $srcRatio = [double]$src.Width / [double]$src.Height
    $dstRatio = [double]$w / [double]$h
    
    if ($dstRatio -gt $srcRatio) {
        $drawW = $w
        $drawH = [int]($w / $srcRatio)
        $drawX = 0
        $drawY = [int](($h - $drawH) / 2)
    } else {
        $drawH = $h
        $drawW = [int]($h * $srcRatio)
        $drawX = [int](($w - $drawW) / 2)
        $drawY = 0
    }
    
    $g.DrawImage($src, $drawX, $drawY, $drawW, $drawH)
    $bmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $src.Dispose()
    Write-Host "Generated: $dstPath ($w x $h)"
}

Scale-Splash 'public/images/splash-screen-bg.jpg' 'android/app/src/main/res/drawable/splash.png' 480 800
Scale-Splash 'public/images/splash-screen-bg.jpg' 'android/app/src/main/res/drawable-port-mdpi/splash.png' 320 480
Scale-Splash 'public/images/splash-screen-bg.jpg' 'android/app/src/main/res/drawable-port-hdpi/splash.png' 480 800
Scale-Splash 'public/images/splash-screen-bg.jpg' 'android/app/src/main/res/drawable-port-xhdpi/splash.png' 720 1280
Scale-Splash 'public/images/splash-screen-bg.jpg' 'android/app/src/main/res/drawable-port-xxhdpi/splash.png' 960 1600
Scale-Splash 'public/images/splash-screen-bg.jpg' 'android/app/src/main/res/drawable-port-xxxhdpi/splash.png' 1280 1920

Scale-Splash 'public/images/splash-screen-bg.jpg' 'android/app/src/main/res/drawable-land-mdpi/splash.png' 480 320
Scale-Splash 'public/images/splash-screen-bg.jpg' 'android/app/src/main/res/drawable-land-hdpi/splash.png' 800 480
Scale-Splash 'public/images/splash-screen-bg.jpg' 'android/app/src/main/res/drawable-land-xhdpi/splash.png' 1280 720
Scale-Splash 'public/images/splash-screen-bg.jpg' 'android/app/src/main/res/drawable-land-xxhdpi/splash.png' 1600 960
Scale-Splash 'public/images/splash-screen-bg.jpg' 'android/app/src/main/res/drawable-land-xxxhdpi/splash.png' 1920 1280

