@echo off
setlocal enabledelayedexpansion

:: エラーハンドリング関数
:handle_error
if errorlevel 1 (
    echo エラーが発生しました: %~1
    exit /b 1
)

:: 各モジュールのディレクトリを設定
set "CURRENT_DIR=%CD%"
set "BUILD_DIR=%CURRENT_DIR%\build"
set "CORE_DIR=%BUILD_DIR%\oid4vc-core"
set "PREX_DIR=%BUILD_DIR%\oid4vc-prex"
set "ENDPOINT_CORE_DIR=%BUILD_DIR%\oid4vc-verifier-endpoint-core"

:: クリーンアップ関数
:cleanup
echo クリーンアップを実行します...
if exist "%BUILD_DIR%" (
    rmdir /s /q "%BUILD_DIR%" || echo 警告: buildディレクトリの削除に失敗しました
)
 if errorlevel 1 (
    exit /b 0
)

echo Verifier Endpointのセットアップを開始します。
echo Cloudflareにログインしていない場合、処理の途中でログインを求められます。
echo 続行するにはEnterキーを押してください。
pause

:: build ディレクトリの存在確認と作成
if not exist "%BUILD_DIR%" (
    mkdir "%BUILD_DIR%" || (
        call :handle_error "buildディレクトリの作成に失敗しました"
    )
)

:: モジュールをクローン
cd "%BUILD_DIR%" || (
    call :handle_error "buildディレクトリへの移動に失敗しました"
)

echo oid4vc-coreをクローンしています...
git clone https://github.com/dentsusoken/oid4vc-core || (
    call :handle_error "oid4vc-coreのクローンに失敗しました"
)

echo oid4vc-prexをクローンしています...
git clone https://github.com/dentsusoken/oid4vc-prex || (
    call :handle_error "oid4vc-prexのクローンに失敗しました"
)

echo oid4vc-verifier-endpoint-coreをクローンしています...
git clone https://github.com/dentsusoken/oid4vc-verifier-endpoint-core || (
    call :handle_error "oid4vc-verifier-endpoint-coreのクローンに失敗しました"
)

echo oid4vc-coreをビルドしています...
cd "%CORE_DIR%" || (
    call :handle_error "oid4vc-coreディレクトリへの移動に失敗しました"
)
call npm install
call npm run build || (
    call :handle_error "oid4vc-coreのビルドに失敗しました"
)
call npm link || (
    call :handle_error "oid4vc-coreのnpm linkに失敗しました"
)

echo oid4vc-prexをビルドしています...
cd "%PREX_DIR%" || (
    call :handle_error "oid4vc-prexディレクトリへの移動に失敗しました"
)
call npm install
call npm link oid4vc-core || (
    call :handle_error "oid4vc-coreのリンクに失敗しました"
)
call npm run build || (
    call :handle_error "oid4vc-prexのビルドに失敗しました"
)
call npm link || (
    call :handle_error "oid4vc-prexのnpm linkに失敗しました"
)

echo oid4vc-verifier-endpoint-coreをビルドしています...
cd "%ENDPOINT_CORE_DIR%" || (
    call :handle_error "oid4vc-verifier-endpoint-coreディレクトリへの移動に失敗しました"
)
call npm install
call npm link oid4vc-core oid4vc-prex || (
    call :handle_error "依存モジュールのリンクに失敗しました"
)
call npm run build || (
    call :handle_error "oid4vc-verifier-endpoint-coreのビルドに失敗しました"
)
call npm link || (
    call :handle_error "oid4vc-verifier-endpoint-coreのnpm linkに失敗しました"
)

echo oid4vc-verifier-endpoint-honoをビルドしています...
cd "%CURRENT_DIR%" || (
    call :handle_error "oid4vc-verifier-endpoint-honoディレクトリへの移動に失敗しました"
)
call npm install
call npm link oid4vc-core oid4vc-prex oid4vc-verifier-endpoint-core || (
    call :handle_error "依存モジュールのリンクに失敗しました"
)

echo Verifier Endpointのセットアップが完了しました。

echo 終了するにはEnterキーを押してください。
pause > nul

exit /b 0 