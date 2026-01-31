@echo off
setlocal
echo ===================================================
echo   GERADOR AUTOMATICO DE APK - HORIMETRO (AUTO)
echo ===================================================
echo.

echo [1/7] Verificando Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado. Instale o Node.js.
    exit /b 1
) else (
    echo Node.js detectado.
)

echo.
echo [2/7] Verificando Java (JDK)...
if exist "%~dp0android\jdk\jdk-17.0.2\bin\java.exe" (
    set "JAVA_HOME=%~dp0android\jdk\jdk-17.0.2"
    set "PATH=%~dp0android\jdk\jdk-17.0.2\bin;%PATH%"
    echo Java encontrado localmente.
) else (
    echo Java local nao encontrado. Tentando sistema...
    java -version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERRO] Java nao encontrado. Executando setup...
        powershell -ExecutionPolicy Bypass -File "%~dp0setup_jdk.ps1"
        if exist "%~dp0android\jdk\jdk-17.0.2\bin\java.exe" (
            set "JAVA_HOME=%~dp0android\jdk\jdk-17.0.2"
            set "PATH=%~dp0android\jdk\jdk-17.0.2\bin;%PATH%"
        ) else (
            echo [ERRO] Falha ao instalar Java.
            exit /b 1
        )
    )
)

echo.
echo [3/7] Configurando Android SDK...
if exist "%~dp0android\sdk" (
    set "ANDROID_HOME=%~dp0android\sdk"
    echo Android SDK encontrado localmente.
) else (
    echo Android SDK local nao encontrado. Executando setup...
    powershell -ExecutionPolicy Bypass -File "%~dp0setup_sdk.ps1"
    if exist "%~dp0android\sdk" (
        set "ANDROID_HOME=%~dp0android\sdk"
    ) else (
        echo [AVISO] SDK nao encontrado em android\sdk. O build pode falhar se nao houver SDK no sistema.
    )
)

echo.
echo [4/7] Gerando build da aplicacao web...
node prepare_standalone.js
if %errorlevel% neq 0 (
    echo [ERRO] Falha no build web.
    exit /b 1
)

echo.
echo [5/7] Sincronizando Capacitor...
if not exist "android" (
    echo Criando projeto Android...
    node node_modules/@capacitor/cli/bin/capacitor add android
)
node node_modules/@capacitor/cli/bin/capacitor sync

echo.
echo [6/7] Compilando APK (Gradle)...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo [ERRO] Falha no build do APK.
    cd ..
    exit /b 1
)
cd ..

echo.
echo [7/7] Copiando APK...
set "SOURCE=android\app\build\outputs\apk\debug\app-debug.apk"
set "DEST=%USERPROFILE%\Desktop\Horimetro-Debug.apk"
if exist "%USERPROFILE%\OneDrive\Desktop" (
    set "DEST=%USERPROFILE%\OneDrive\Desktop\Horimetro-Debug.apk"
)

if exist "%SOURCE%" (
    copy /Y "%SOURCE%" "%DEST%"
    echo.
    echo ===================================================
    echo   SUCESSO! O APK FOI GERADO EM:
    echo   %DEST%
    echo ===================================================
) else (
    echo [ERRO] APK nao encontrado na saida do build.
    exit /b 1
)

exit /b 0