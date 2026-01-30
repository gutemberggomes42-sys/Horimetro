@echo off
setlocal
echo ===================================================
echo   GERADOR AUTOMATICO DE APK - HORIMETRO (V2)
echo ===================================================
echo.

echo [1/7] Verificando Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js nao encontrado. Tentando instalar via Winget...
    winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    echo.
    echo Por favor, REINICIE este script apos a instalacao do Node.js terminar.
    echo (Feche esta janela e abra novamente o arquivo gerar_apk_completo.bat)
    pause
    exit /b
) else (
    echo Node.js detectado.
)

echo.
echo [2/7] Verificando Java (JDK)...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Java nao encontrado. Tentando instalar OpenJDK via Winget...
    winget install -e --id Microsoft.OpenJDK.17 --accept-source-agreements --accept-package-agreements
    echo.
    echo Por favor, REINICIE este script apos a instalacao do Java terminar.
    pause
    exit /b
) else (
    echo Java detectado.
)

echo.
echo [3/7] Instalando dependencias do projeto...
call npm install
if %errorlevel% neq 0 (
    echo [ERRO] Falha no npm install.
    pause
    exit /b 1
)

echo.
echo [4/7] Gerando build da aplicacao web...
call npm run build:web

echo.
echo [5/7] Configurando plataforma Android...
if not exist "android" (
    echo Criando projeto Android...
    call npx cap add android
)

echo Sincronizando arquivos...
call npx cap sync

echo.
echo [6/7] Compilando APK (Gradle)...
if exist "android" (
    cd android
    if not exist "gradlew.bat" (
        echo [ERRO] gradlew.bat nao encontrado!
        cd ..
        pause
        exit /b 1
    )
    echo Iniciando build do APK...
    call gradlew.bat assembleDebug
    cd ..
) else (
    echo [ERRO] Pasta android nao encontrada.
    pause
    exit /b 1
)

echo.
echo [7/7] Verificando APK...
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo.
    echo ===================================================
    echo   SUCESSO! O APK FOI GERADO.
    echo ===================================================
    copy "android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Desktop\Horimetro-Debug.apk"
    echo Arquivo copiado para sua Area de Trabalho: Horimetro-Debug.apk
) else (
    echo [ERRO] APK nao encontrado. Verifique o console.
)

echo.
pause
