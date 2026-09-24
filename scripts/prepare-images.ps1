Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "FOOD PICTURES"
$dest = Join-Path $root "client\public\food"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$map = @{
  "1.png"  = "01-poster.jpg"
  "2.png"  = "02-wrap-steam.jpg"
  "3.png"  = "03-wrap-fire.jpg"
  "4.png"  = "04-wrap-fries.jpg"
  "5.png"  = "05-wrap-stand.jpg"
  "6.png"  = "06-kitchen.jpg"
  "7.png"  = "07-craft.jpg"
  "8.png"  = "08-service.jpg"
  "9.jpg"  = "09-pita.jpg"
  "10.jpg" = "10-hand.jpg"
  "11.png" = "11-hero.jpg"
}

function Save-WebImage($from, $to, $maxW) {
  $img = [System.Drawing.Image]::FromFile($from)
  $w = $img.Width
  $h = $img.Height
  if ($w -gt $maxW) {
    $h = [int]($h * ($maxW / $w))
    $w = $maxW
  }
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img, 0, 0, $w, $h)
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $enc = New-Object System.Drawing.Imaging.EncoderParameters 1
  $enc.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]82)
  $bmp.Save($to, $codec, $enc)
  $g.Dispose()
  $bmp.Dispose()
  $img.Dispose()
}

foreach ($key in $map.Keys) {
  $from = Join-Path $src $key
  $to = Join-Path $dest $map[$key]
  Save-WebImage $from $to 1600
  $size = (Get-Item $to).Length
  Write-Output ("{0} -> {1} ({2}kb)" -f $key, $map[$key], [int]($size / 1024))
}
