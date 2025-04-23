# oid4vc-verifier-endpoint-hono

## How to build

### Create .dev.vars

```bash
JAR_SIGNING_PRIVATE_JWK="YOUR_JAR_SIGNING_PRIVATE_JWK"
CLIENT_ID="YOUR_CLIENT_ID"
CLIENT_ID_SCHEME="x509_san_dns"
PUBLIC_URL_VERIFIER_ENDPOINT="http://localhost:8080"
CORS_ORIGIN="*"
```

### Install dependencies

npm install

### Run locally

npm run dev

### Deploy

npm run deploy

## How to emulate AWS Lambda (localstack)

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
   PUBLIC_URL_VERIFIER_ENDPOINT=http://localhost:8080
   CORS_ORIGIN=*
   DEPLOY_ENV=local
   ```

3. Rebuilding the Image and Starting the Container:
   ```bash
   docker-compose up --build
   ```
## How to deploy AWS Lambda

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

2. IAM Role Configuration:

   **Add to the IAM role you are using**

   * AWSLambdaBasicExecutionRole
   * AWSLambdaDynamoDBExecutionRole
   * dynamodb:GetItem
   * SecretsManagerReadWrite

3. Set Environment Variables for SecretsManager:
   ```bash
   JAR_SIGNING_PRIVATE_JWK=YOUR_JAR_SIGNING_PRIVATE_JWK
   CLIENT_ID=YOUR_CLIENT_ID
   CLIENT_ID_SCHEME=x509_san_dns
   PUBLIC_URL_VERIFIER_ENDPOINT=http://localhost:8080
   CORS_ORIGIN=*
   DYNAMODB_TABLE_VERIFIER_ENDPOINT=PRESENTATION_KV
   ```

4. Create .env
   ```bash
   DYNAMODB_TABLE_VERIFIER_ENDPOINT=PRESENTATION_KV
   AWS_DEFAULT_REGION=ap-northeast-1
   LAMBDA_ROLE_NAME=arn:aws:iam::xxx:role/role-name
   AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
   ```

4. Build:
   ```bash
   docker build -t verifier-endpoint:latest .
   ```

5. Run:
   ```bash
   docker run --env-file ./.env verifier-endpoint:latest
   ```