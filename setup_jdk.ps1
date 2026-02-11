$ErrorActionPreference = "Stop"

$jdkUrl = "https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip"
$zipFile = "openjdk.zip"
# Use o diretório android/jdk para manter organizado e consistente com o bat
$destDir = "android\jdk" 

# Criar diretorio se nao existir
if (!(Test-Path -Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

Write-Host "Baixando OpenJDK 17..."
Invoke-WebRequest -Uri $jdkUrl -OutFile $zipFile

Write-Host "Extraindo para $destDir..."
Expand-Archive -Path $zipFile -DestinationPath $destDir -Force

Write-Host "Configurando..."
$extractedDir = Get-ChildItem -Path $destDir | Select-Object -First 1
$jdkPath = $extractedDir.FullName

Write-Host "JDK instalado em: $jdkPath"
Write-Host "Removendo arquivo zip..."
Remove-Item $zipFile

Write-Host "Concluido!"
