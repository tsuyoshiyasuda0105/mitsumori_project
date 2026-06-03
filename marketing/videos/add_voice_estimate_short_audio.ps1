$ErrorActionPreference = "Stop"

$videoPath = "C:\mitsumori_project\web\public\videos\voice-estimate-short.mp4"
$wavPath = "C:\mitsumori_project\marketing\videos\voice-estimate-short-narration.wav"
$tempPath = "C:\mitsumori_project\web\public\videos\voice-estimate-short-with-audio.mp4"
$ffmpegPath = "C:\mitsumori_project\tools\py_video_deps\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"

if (-not (Test-Path -LiteralPath $videoPath)) {
  throw "Video file was not found: $videoPath"
}

if (-not (Test-Path -LiteralPath $ffmpegPath)) {
  throw "ffmpeg was not found: $ffmpegPath"
}

Add-Type -AssemblyName System.Speech

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice = $synth.GetInstalledVoices() |
  Where-Object { $_.VoiceInfo.Culture.Name -eq "ja-JP" } |
  Select-Object -First 1

if ($null -eq $voice) {
  throw "Japanese speech voice was not found."
}

$synth.SelectVoice($voice.VoiceInfo.Name)
$synth.Rate = 2
$synth.Volume = 100
$synth.SetOutputToWaveFile($wavPath)
$narrationCodes = @(
  20837,21147,12364,33510,25163,12394,26041,12391,12418,12289,
  22768,12391,35211,31309,26126,32048,12434,20316,25104,12290,
  21336,20385,12510,12473,12479,12540,12391,20385,26684,12434,
  32113,19968,12375,12289,12456,12463,12475,12523,12420,20182,
  12398,12471,12473,12486,12512,12408,20986,21147,12290,24314,
  35373,26989,21521,12369,12289,38899,22768,65,73,35211,31309,12290
)
$narration = -join ($narrationCodes | ForEach-Object { [char]$_ })
$synth.Speak($narration)
$synth.SetOutputToNull()
$synth.Dispose()

$ffmpegArgs = @(
  "-y",
  "-i", $videoPath,
  "-i", $wavPath,
  "-filter_complex", "[1:a]apad=pad_dur=15,atrim=0:15[a]",
  "-map", "0:v:0",
  "-map", "[a]",
  "-c:v", "copy",
  "-c:a", "aac",
  "-b:a", "128k",
  "-movflags", "+faststart",
  $tempPath
)

& $ffmpegPath @ffmpegArgs

if (-not (Test-Path -LiteralPath $tempPath)) {
  throw "Video with audio was not created: $tempPath"
}

Move-Item -LiteralPath $tempPath -Destination $videoPath -Force
Write-Output $videoPath
