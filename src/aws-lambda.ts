import { Hono } from 'hono';
import { handle, defaultIsContentTypeBinary } from 'hono/aws-lambda';
import { Env } from './env';
import { VerifierApi } from './adapters/input/VerifierApi';
import { WalletApi } from './adapters/input/WalletApi';
import { ConfigurationImpl, getDI } from './di/aws-lambda';
import { dynamoDBMiddleware } from '@squilla/hono-aws-middlewares/dynamodb';
import { secretsManagerMiddleware } from '@squilla/hono-aws-middlewares/secrets-manager';
import { setupAwsLambda } from './middleware/setupAwsLambda';

const configuration = new ConfigurationImpl();

const verifierApi = new VerifierApi(
  configuration.initTransactionPath(),
  configuration.getWalletResponsePath(':transactionId'),
  configuration.frontendCorsOrigin(),
  getDI
);

const walletApi = new WalletApi(
  configuration.requestJWTPath(':requestId'),
  configuration.presentationDefinitionPath(':requestId'),
  configuration.walletResponsePath(),
  configuration.getPublicJWKSetPath(),
  configuration.jarmJWKSetPath(':requestId'),
  getDI
);

const app = new Hono<Env>()
  .get('/', (c) => c.json({ message: 'Hello, World!' }))
  .use(secretsManagerMiddleware())
  .use(dynamoDBMiddleware())
  .use(setupAwsLambda())
  .route('/', verifierApi.route)
  .route('/', walletApi.route);

const isContentTypeBinary = (contentType: string) => {
  return (
    !/^application\/oauth-authz-req\+jwt$/.test(contentType) &&
    defaultIsContentTypeBinary(contentType)
  );
};

// export default app;
export const handler = handle(app, { isContentTypeBinary });
