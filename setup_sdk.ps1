$ErrorActionPreference = "Stop"

$sdkUrl = "https://dl.google.com/android/repository/commandlinetools-win-10406996_latest.zip"
$zipFile = "cmdline-tools.zip"
$sdkDir = "$PSScriptRoot\android\sdk"
$cmdlineDir = "$sdkDir\cmdline-tools"

# Create directories
if (!(Test-Path -Path $cmdlineDir)) {
    New-Item -ItemType Directory -Force -Path $cmdlineDir | Out-Null
}

# Download Command Line Tools
Write-Host "Baixando Android Command Line Tools..."
Invoke-WebRequest -Uri $sdkUrl -OutFile $zipFile

# Extract
Write-Host "Extraindo..."
Expand-Archive -Path $zipFile -DestinationPath $sdkDir -Force

# Move to correct structure (cmdline-tools/latest)
$extractedCmdline = "$sdkDir\cmdline-tools"
# The zip contains a folder named 'cmdline-tools' with 'bin', 'lib', etc.
# We need to move the content of extracted 'cmdline-tools' to 'cmdline-tools/latest'
# But Expand-Archive extracts 'cmdline-tools' folder into $sdkDir.
# So we have $sdkDir\cmdline-tools\bin etc.
# We want $sdkDir\cmdline-tools\latest\bin etc.

# Rename cmdline-tools to latest
Rename-Item -Path "$sdkDir\cmdline-tools" -NewName "latest"
# Create parent cmdline-tools
New-Item -ItemType Directory -Force -Path "$sdkDir\cmdline-tools" | Out-Null
# Move latest into cmdline-tools
Move-Item -Path "$sdkDir\latest" -Destination "$sdkDir\cmdline-tools"

# Clean up zip
Remove-Item $zipFile

# Set environment variables for this session
$env:ANDROID_HOME = $sdkDir
$env:JAVA_HOME = "$PSScriptRoot\android\jdk\jdk-17.0.2"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:PATH"

# Accept Licenses
Write-Host "Aceitando licencas..."
& { for($i=0;$i -lt 10;$i++) { echo y } } | sdkmanager --licenses --sdk_root=$sdkDir

# Install Platform Tools and SDK Platform
Write-Host "Instalando Platform Tools e SDK..."
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.1" --sdk_root=$sdkDir

# Create local.properties
$localPropsPath = "$PSScriptRoot\android\local.properties"
"sdk.dir=$sdkDir".Replace("\", "/") | Out-File -Encoding ascii $localPropsPath

Write-Host "Android SDK configurado!"
