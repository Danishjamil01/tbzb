Add-Type -AssemblyName System.Drawing

function Generate-Splash($filePath, $w, $h) {
    $dir = Split-Path $filePath
    if (!(Test-Path $dir)) { 
        New-Item -ItemType Directory -Path $dir -Force | Out-Null 
    }
    
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $cTop = [System.Drawing.Color]::FromArgb(15, 71, 43)
    $cBot = [System.Drawing.Color]::FromArgb(6, 29, 18)
    $brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $cTop, $cBot, [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
    $g.FillRectangle($brushBg, $rect)
    
    $cx = [int]($w / 2)
    $cy = [int]($h / 2) - [int]($h * 0.05)
    
    $radius = [Math]::Min($w, $h) * 0.16
    if ($radius -lt 24) { $radius = 24 }
    $penGold = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(245, 158, 11), [Math]::Max(3, [int]($radius * 0.05)))
    $g.DrawEllipse($penGold, [float]($cx - $radius), [float]($cy - $radius), [float]($radius * 2), [float]($radius * 2))
    
    $innerRadius = $radius * 0.88
    $brushInner = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(11, 47, 29))
    $g.FillEllipse($brushInner, [float]($cx - $innerRadius), [float]($cy - $innerRadius), [float]($innerRadius * 2), [float]($innerRadius * 2))
    
    $fontSize = [Math]::Max(10, [int]($radius * 0.38))
    $fontTBZB = New-Object System.Drawing.Font('Arial', $fontSize, [System.Drawing.FontStyle]::Bold)
    $brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString('TBZB', $fontTBZB, $brushWhite, [float]$cx, [float]$cy, $sf)
    
    $titleSize = [Math]::Max(12, [int]($radius * 0.32))
    $fontTitle = New-Object System.Drawing.Font('Arial', $titleSize, [System.Drawing.FontStyle]::Bold)
    $brushGold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(254, 240, 138))
    $titleY = $cy + $radius + ($h * 0.04)
    $g.DrawString('THE BITE ZONE', $fontTitle, $brushGold, [float]$cx, [float]$titleY, $sf)
    
    $subSize = [Math]::Max(9, [int]($radius * 0.20))
    $fontBidar = New-Object System.Drawing.Font('Arial', $subSize, [System.Drawing.FontStyle]::Bold)
    $brushAmber = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 158, 11))
    $g.DrawString('BIDAR', $fontBidar, $brushAmber, [float]$cx, [float]($titleY + $titleSize * 1.6), $sf)
    
    $tagSize = [Math]::Max(8, [int]($radius * 0.15))
    $fontTag = New-Object System.Drawing.Font('Arial', $tagSize, [System.Drawing.FontStyle]::Regular)
    $brushMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(167, 243, 208))
    $g.DrawString('Rolls * Biryani * Delicacies', $fontTag, $brushMuted, [float]$cx, [float]($titleY + $titleSize * 3.0), $sf)
    
    $bmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $filePath"
}

# Portrait Splash Screens
Generate-Splash 'android/app/src/main/res/drawable/splash.png' 480 800
Generate-Splash 'android/app/src/main/res/drawable-port-mdpi/splash.png' 320 480
Generate-Splash 'android/app/src/main/res/drawable-port-hdpi/splash.png' 480 800
Generate-Splash 'android/app/src/main/res/drawable-port-xhdpi/splash.png' 720 1280
Generate-Splash 'android/app/src/main/res/drawable-port-xxhdpi/splash.png' 960 1600
Generate-Splash 'android/app/src/main/res/drawable-port-xxxhdpi/splash.png' 1280 1920

# Landscape Splash Screens
Generate-Splash 'android/app/src/main/res/drawable-land-mdpi/splash.png' 480 320
Generate-Splash 'android/app/src/main/res/drawable-land-hdpi/splash.png' 800 480
Generate-Splash 'android/app/src/main/res/drawable-land-xhdpi/splash.png' 1280 720
Generate-Splash 'android/app/src/main/res/drawable-land-xxhdpi/splash.png' 1600 960
Generate-Splash 'android/app/src/main/res/drawable-land-xxxhdpi/splash.png' 1920 1280
