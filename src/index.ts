import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './env';
import { VerifierApi } from './adapters/input/VerifierApi';
import { WalletApi } from './adapters/input/WalletApi';
import { HonoConfiguration } from './di/HonoConfiguration';

const configuration = new HonoConfiguration();

const verifierApi = new VerifierApi(
  configuration.initTransactionPath(),
  configuration.getWalletResponsePath(':transactionId')
);
const walletApi = new WalletApi(
  configuration.requestJWTPath(':requestId'),
  configuration.presentationDefinitionPath(':requestId'),
  configuration.walletResponsePath(),
  configuration.getPublicJWKSetPath(),
  configuration.jarmJWKSetPath(':requestId')
);

const app = new Hono<Env>()
  .use('*', (c, next) => cors({ origin: c.env.CORS_ORIGIN })(c, next))
  .route('/', verifierApi.route)
  .route('/', walletApi.route);

export default app;
