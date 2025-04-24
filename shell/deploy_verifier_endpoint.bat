@echo off
setlocal enabledelayedexpansion

:: �G���[�n���h�����O�֐�
:handle_error
if errorlevel 1 (
    echo �G���[���������܂���: %~1
    exit /b 1
)

echo Verifier Endpoint�̃f�v���C���J�n���܂��B
echo Cloudflare�Ƀ��O�C�����Ă��Ȃ��ꍇ�A�����̓r���Ń��O�C�������߂��܂��B
echo ���s����ɂ�Enter�L�[�������Ă��������B
pause > nul


:: �e���W���[���̃f�B���N�g����ݒ�
set "CURRENT_DIR=%CD%"
set "BUILD_DIR=%CURRENT_DIR%\build"
set "CORE_DIR=%BUILD_DIR%\oid4vc-core"
set "PREX_DIR=%BUILD_DIR%\oid4vc-prex"
set "ENDPOINT_CORE_DIR=%BUILD_DIR%\oid4vc-verifier-endpoint-core"

:: �N���[���A�b�v�֐�
:cleanup
echo �N���[���A�b�v�����s���܂�...
if exist "%BUILD_DIR%" (
    rmdir /s /q "%BUILD_DIR%" || echo �x��: build�f�B���N�g���̍폜�Ɏ��s���܂���
)
 if errorlevel 1 (
    exit /b 0
)

:: build �f�B���N�g���̑��݊m�F�ƍ쐬
if not exist "%BUILD_DIR%" (
    mkdir "%BUILD_DIR%" || (
        call :handle_error "build�f�B���N�g���̍쐬�Ɏ��s"
    )
)

:: ���W���[�����N���[��
cd "%BUILD_DIR%" || (
    call :handle_error "build�f�B���N�g���ւ̈ړ��Ɏ��s"
)

echo oid4vc-core���N���[�����Ă��܂�...
git clone https://github.com/dentsusoken/oid4vc-core || (
    call :handle_error "oid4vc-core�̃N���[���Ɏ��s"
)

echo oid4vc-prex���N���[�����Ă��܂�...
git clone https://github.com/dentsusoken/oid4vc-prex || (
    call :handle_error "oid4vc-prex�̃N���[���Ɏ��s"
)

echo oid4vc-verifier-endpoint-core���N���[�����Ă��܂�...
git clone https://github.com/dentsusoken/oid4vc-verifier-endpoint-core || (
    call :handle_error "oid4vc-verifier-endpoint-core�̃N���[���Ɏ��s"
)

echo oid4vc-core���r���h���Ă��܂�...
cd "%CORE_DIR%" || (
    call :handle_error "oid4vc-core�f�B���N�g���ւ̈ړ��Ɏ��s"
)
call npm install || (
    call :handle_error "oid4vc-core��npm install�Ɏ��s"
)
call npm run build || (
    call :handle_error "oid4vc-core�̃r���h�Ɏ��s"
)
call npm link || (
    call :handle_error "oid4vc-core��npm link�Ɏ��s"
)

echo oid4vc-prex���r���h���Ă��܂�...
cd "%PREX_DIR%" || (
    call :handle_error "oid4vc-prex�f�B���N�g���ւ̈ړ��Ɏ��s"
)
call npm install || (
    call :handle_error "oid4vc-prex��npm install�Ɏ��s"
)
call npm link oid4vc-core || (
    call :handle_error "oid4vc-core�̃����N�Ɏ��s"
)
call npm run build || (
    call :handle_error "oid4vc-prex�̃r���h�Ɏ��s"
)
call npm link || (
    call :handle_error "oid4vc-prex��npm link�Ɏ��s"
)

echo oid4vc-verifier-endpoint-core���r���h���Ă��܂�...
cd "%ENDPOINT_CORE_DIR%" || (
    call :handle_error "oid4vc-verifier-endpoint-core�f�B���N�g���ւ̈ړ��Ɏ��s"
)
call npm install || (
    call :handle_error "oid4vc-verifier-endpoint-core��npm install�Ɏ��s"
)
call npm link oid4vc-core oid4vc-prex || (
    call :handle_error "�ˑ����W���[���̃����N�Ɏ��s"
)
call npm run build || (
    call :handle_error "oid4vc-verifier-endpoint-core�̃r���h�Ɏ��s"
)
call npm link || (
    call :handle_error "oid4vc-verifier-endpoint-core��npm link�Ɏ��s"
)

echo oid4vc-verifier-endpoint-hono���r���h���Ă��܂�...
cd "%CURRENT_DIR%" || (
    call :handle_error "oid4vc-verifier-endpoint-hono�f�B���N�g���ւ̈ړ��Ɏ��s"
)
call npm install || (
    call :handle_error "oid4vc-verifier-endpoint-hono��npm install�Ɏ��s"
)
call npm link oid4vc-core oid4vc-prex oid4vc-verifier-endpoint-core || (
    call :handle_error "�ˑ����W���[���̃����N�Ɏ��s"
)
call npm i -g wrangler || (
    call :handle_error "wrangler�̃C���X�g�[���Ɏ��s"
)
call npx wrangler login || (
    call :handle_error "Cloudflare�ւ̃��O�C���Ɏ��s"
)
call npm run deploy || (
    call :handle_error "�f�v���C�Ɏ��s"
)

echo Verifier Endpoint�̃f�v���C���������܂����B

:: ����I�����̃N���[���A�b�v
call :cleanup
exit /b 0 