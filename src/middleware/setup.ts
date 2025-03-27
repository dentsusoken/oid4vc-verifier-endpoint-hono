import { createMiddleware } from 'hono/factory';
import { env } from 'hono/adapter';
import { Env } from '../env';
import * as Aws from 'aws-sdk'

async function getSecret(secretName: string, region: string, endpoint?: string): Promise<void> {
    const client = new Aws.SecretsManager({
        region,
        endpoint
    });

    try {
        const data = await client.getSecretValue({ SecretId: secretName }).promise();

        if ('SecretString' in data) {
            const secret = data.SecretString;
            const secretObj = JSON.parse(secret!);

            for (const [key, value] of Object.entries(secretObj)) {
                process.env[key] = value as string;
            }
        }
    } catch (err) {
        console.error(`Error retrieving secret: ${err}`);
    }
}

export const setupLambdaMiddleware = createMiddleware(async (c, next) => {
    const deployEnv = process.env.DEPLOY_ENV || 'aws';
    const secretName = "twEnviromentVariables";
    const region = "ap-northeast-1";
    const endpoint = deployEnv === 'local' ? 'http://localhost:4566' : undefined;

    await getSecret(secretName, region, endpoint);

    c.env = {
        ...c.env,
        JAR_SIGNING_PRIVATE_JWK: process.env.JAR_SIGNING_PRIVATE_JWK,
        CLIENT_ID: process.env.CLIENT_ID,
        CLIENT_ID_SCHEME: process.env.CLIENT_ID_SCHEME,
        PUBLIC_URL: process.env.PUBLIC_URL_VERIFIER_ENDPOINT,
        CORS_ORIGIN: process.env.CORS_ORIGIN,
        PRESENTATION_KV: process.env.PRESENTATION_KV || '',
        DYNAMODB_TABLE: process.env.DYNAMODB_TABLE_VERIFIER_ENDPOINT || '',
    };
    return next();
});