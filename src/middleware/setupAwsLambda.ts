import { Context, Next } from 'hono';
import { AwsEnv } from '../env';

export const setupAwsLambda = () => {
  return async (c: Context<AwsEnv>, next: Next) => {
    const secretsManager = c.get('SecretsManager');
    const response = await secretsManager.getSecretValue({
      SecretId: process.env.SECRET_NAME || 'issuer-secrets',
    });
    const secret = JSON.parse(response.SecretString || '{}');

    c.env = {
      ...c.env,
      JAR_SIGNING_PRIVATE_JWK: secret.JAR_SIGNING_PRIVATE_JWK,
      CLIENT_ID: secret.CLIENT_ID,
      CLIENT_ID_SCHEME: secret.CLIENT_ID_SCHEME,
      PUBLIC_URL: secret.PUBLIC_URL,
      CORS_ORIGIN: secret.CORS_ORIGIN,
    };
    return next();
  };
};
