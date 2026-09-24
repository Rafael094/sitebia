# prepare-brand-logo.ps1
#
# Prepara os PNGs da marca para uso no site:
#   1. Remove o "xadrez" de transparência que ficou "assado" nos pixels
#      (os arquivos de origem são 24bpp RGB, sem canal alfa);
#   2. Recorta o artboard para um quadrado 1:1 com margem uniforme;
#   3. Redimensiona para 512x512 (sobra para telas retina) com transparência real;
#   4. Salva em public/images/brand/ com o nome final.
#
# Estratégia (os dois arquivos compartilham o MESMO xadrez):
#   - No arquivo "dark" o monograma é navy/dourado: fácil de detectar.
#   - No arquivo "light" o monograma é branco sobre um xadrez que também é
#     branco/cinza-claro (245/252/253), então luminância NÃO separa os dois.
#     Solução: usar a máscara do "dark" como gabarito da marca — o que é tinta
#     em um arquivo é tinta no outro (mesma posição/geometria).
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File scripts/prepare-brand-logo.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/prepare-brand-logo.ps1 -SourceDir "C:\caminho"

param(
  [string]$SourceDir = (Join-Path $env:USERPROFILE 'OneDrive\Área de Trabalho'),
  [string]$OutDir = (Join-Path $PSScriptRoot '..\public\images\brand'),
  [int]$Size = 512 # lado final do PNG quadrado
)

Add-Type -AssemblyName System.Drawing

$darkIn = Join-Path $SourceDir 'logo-simbolo-dark.png'
$lightIn = Join-Path $SourceDir 'logo-simbolo-light.png'
$darkOut = Join-Path (Resolve-Path $OutDir) 'logo-monograma-dark.png'
$lightOut = Join-Path (Resolve-Path $OutDir) 'logo-monograma-light.png'

foreach ($p in @($darkIn, $lightIn)) {
  if (-not (Test-Path $p)) { throw "Arquivo de origem nao encontrado: $p" }
}

$dark = [System.Drawing.Bitmap]::new($darkIn)
$w = $dark.Width
$h = $dark.Height
Write-Output "Origem: ${w}x${h}"

# --- 1. Máscara bruta pelo arquivo "dark" (navy/dourado sobre xadrez claro) --
#   navy  => canal maximo baixo (<= 232) e neutro
#   ouro  => saturacao alta
$raw = New-Object 'bool[,]' $w, $h
for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    $c = $dark.GetPixel($x, $y)
    $max = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
    $min = [Math]::Min($c.R, [Math]::Min($c.G, $c.B))
    $sat = if ($max -gt 0) { ($max - $min) / $max } else { 0 }
    if ($max -le 232 -or $sat -ge 0.18) { $raw[$x, $y] = $true }
  }
}

# --- 2. Refina: exige vizinhança densa (o traço da marca é contínuo) --------
$ink = New-Object 'bool[,]' $w, $h
for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    if (-not $raw[$x, $y]) { continue }
    $total = 0; $hits = 0
    for ($dy = -3; $dy -le 3; $dy++) {
      for ($dx = -3; $dx -le 3; $dx++) {
        $nx = $x + $dx; $ny = $y + $dy
        if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $w -or $ny -ge $h) { continue }
        $total++
        if ($raw[$nx, $ny]) { $hits++ }
      }
    }
    if ($hits -ge ($total * 0.30)) { $ink[$x, $y] = $true }
  }
}

# --- 3. Bounding box da tinta ----------------------------------------------
$minX = $w; $minY = $h; $maxX = -1; $maxY = -1
for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    if ($ink[$x, $y]) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
if ($maxX -lt 0) { throw 'Nenhum pixel de marca detectado.' }

$cw = $maxX - $minX + 1
$ch = $maxY - $minY + 1
Write-Output "Marca: ${cw}x${ch} em ($minX,$minY)"

# --- 4. Quadrado com margem uniforme ---------------------------------------
$pad = [int]([Math]::Max($cw, $ch) * 0.06)
$side = [Math]::Max($cw, $ch) + (2 * $pad)
$offX = [int]((($minX + $maxX) / 2) - ($side / 2))
$offY = [int]((($minY + $maxY) / 2) - ($side / 2))
Write-Output "Recorte: ${side}x${side} em ($offX,$offY)"

# --- 5. Desenha cada variante usando a mesma máscara ------------------------
function Export-Variant {
  param(
    [System.Drawing.Bitmap]$Source,
    [bool[,]]$Mask,
    [int]$OffX, [int]$OffY, [int]$Side, [int]$OutSize,
    [string]$OutPath, [string]$Mode
  )

  # Recorta o quadrado do arquivo original.
  $crop = New-Object System.Drawing.Bitmap $Side, $Side, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gc = [System.Drawing.Graphics]::FromImage($crop)
  $gc.Clear([System.Drawing.Color]::Transparent)
  $gc.DrawImage(
    $Source,
    [System.Drawing.Rectangle]::new(0, 0, $Side, $Side),
    [System.Drawing.Rectangle]::new($OffX, $OffY, $Side, $Side),
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $gc.Dispose()

  # Alfa: 255 dentro da máscara (com suavização nas bordas), 0 fora dela.
  for ($y = 0; $y -lt $Side; $y++) {
    for ($x = 0; $x -lt $Side; $x++) {
      $sx = $OffX + $x
      $sy = $OffY + $y
      $c = $crop.GetPixel($x, $y)

      $inside = $false
      if ($sx -ge 0 -and $sy -ge 0 -and $sx -lt $w -and $sy -lt $h) { $inside = $Mask[$sx, $sy] }

      if (-not $inside) {
        $crop.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        continue
      }

      # Dentro da marca: no arquivo "light" o traço é branco (#FDFDFD..FFFFFF)
      # e o fundo do xadrez é 252/253 — então a cor final precisa virar branco
      # puro para não guardar restos do xadrez nas bordas.
      if ($Mode -eq 'light') {
        if ($c.R -ge 250 -and $c.G -ge 250 -and $c.B -ge 250) {
          $crop.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 255, 255))
        }
      }
    }
  }

  # Suaviza as bordas externas da máscara (transição de 1 px).
  $soft = New-Object System.Drawing.Bitmap $Side, $Side, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gs = [System.Drawing.Graphics]::FromImage($soft)
  $gs.Clear([System.Drawing.Color]::Transparent)
  $gs.DrawImageUnscaled($crop, 0, 0)
  $gs.Dispose()

  for ($y = 1; $y -lt ($Side - 1); $y++) {
    for ($x = 1; $x -lt ($Side - 1); $x++) {
      $c = $soft.GetPixel($x, $y)
      if ($c.A -ne 255) { continue }
      # Se algum vizinho é transparente, é contorno => alfa reduzido.
      $isEdge = $false
      foreach ($o in @(@(-1, 0), @(1, 0), @(0, -1), @(0, 1))) {
        if ($soft.GetPixel($x + $o[0], $y + $o[1]).A -eq 0) { $isEdge = $true; break }
      }
      if ($isEdge) {
        $soft.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(190, $c.R, $c.G, $c.B))
      }
    }
  }

  # Redimensiona mantendo o alfa (bicúbica de alta qualidade).
  $final = New-Object System.Drawing.Bitmap $OutSize, $OutSize, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gi = [System.Drawing.Graphics]::FromImage($final)
  $gi.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $gi.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $gi.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gi.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $gi.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $gi.Clear([System.Drawing.Color]::Transparent)
  $gi.DrawImage($soft, [System.Drawing.Rectangle]::new(0, 0, $OutSize, $OutSize))
  $gi.Dispose()

  $final.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $final.Dispose(); $soft.Dispose(); $crop.Dispose()

  Write-Output "  -> $OutPath (${OutSize}x${OutSize}, ARGB transparente)"
}

$light = [System.Drawing.Bitmap]::new($lightIn)

Export-Variant -Source $dark -Mask $ink -OffX $offX -OffY $offY -Side $side -OutSize $Size -OutPath $darkOut -Mode 'dark'
Export-Variant -Source $light -Mask $ink -OffX $offX -OffY $offY -Side $side -OutSize $Size -OutPath $lightOut -Mode 'light'

$light.Dispose()
$dark.Dispose()

Write-Output 'Concluído.'
