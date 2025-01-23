# oid4vc-verifier-endpoint-hono

## How to build

### Create .dev.vars

JAR_SIGNING_PRIVATE_JWK="YOUR_JAR_SIGNING_PRIVATE_JWK"
CLIENT_ID="YOUR_CLIENT_ID"
CLIENT_ID_SCHEME="x509_san_dns"
PUBLIC_URL="http://localhost:8787"
CORS_ORIGIN="*"

### Install dependencies

npm install

### Run locally

npm run dev

### Deploy

npm run deploy

## How to emulate AWS Lambda

### Prerequisites
1. Clone or copy the following repositories into the `./build` directory:
   - [`oid4vc-core`](https://github.com/dentsusoken/oid4vc-core.git)
   - [`oid4vc-prex`](https://github.com/dentsusoken/oid4vc-prex.git)
   - [`oid4vc-verifier-endpoint-core`](https://github.com/dentsusoken/oid4vc-verifier-endpoint-core.git)

   ```bash
   # If cloning new repositories
   cd build
   git clone https://github.com/dentsusoken/oid4vc-core.git
   git clone https://github.com/dentsusoken/oid4vc-prex.git
   git clone https://github.com/dentsusoken/oid4vc-verifier-endpoint-core.git
   
   # Or if copying existing local development repositories
   cp -r /path/to/local/oid4vc-core ./build/
   cp -r /path/to/local/oid4vc-prex ./build/
   cp -r /path/to/local/oid4vc-verifier-endpoint-core ./build/
   ```

2. Create .env
    ```bash
    JAR_SIGNING_PRIVATE_JWK=YOUR_JAR_SIGNING_PRIVATE_JWK
    CLIENT_ID=YOUR_CLIENT_ID
    CLIENT_ID_SCHEME=x509_san_dns
    PUBLIC_URL=http://localhost:8787
    CORS_ORIGIN=*
    ```

3. Start the Dev Container:
   ```bash
   # Open in VS Code and click "Reopen in Container"
   # Or use the command palette: F1 -> "Dev Containers: Rebuild and Reopen in Container"
   ```

4. Inside the container, run the setup script:
   ```bash
   ./shell/setupLinks.sh
   ```

5. Start the Lambda emulator:
   ```bash
   npm run emulate:lambda
   ```