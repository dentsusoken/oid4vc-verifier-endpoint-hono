import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { Env } from './env';
import { LambdaVerifierApi } from './adapters/input/LambdaVerifierApi';
import { LambdaWalletApi } from './adapters/input/LambdaWalletApi';
import { HonoConfiguration } from './di/HonoConfiguration';

const configuration = new HonoConfiguration();

const verifierApi = new LambdaVerifierApi(
  configuration.initTransactionPath(),
  configuration.getWalletResponsePath(':transactionId'),
  configuration.frontendCorsOrigin()
);
const walletApi = new LambdaWalletApi(
  configuration.requestJWTPath(':requestId'),
  configuration.presentationDefinitionPath(':requestId'),
  configuration.walletResponsePath(),
  configuration.getPublicJWKSetPath(),
  configuration.jarmJWKSetPath(':requestId')
);

const app = new Hono<Env>()
  .route('/', verifierApi.route)
  .route('/', walletApi.route);

// export default app;
export const handler = handle(app);
