import { Hono } from 'hono';
import { Env } from './env';
import { VerifierApi } from './adapters/input/VerifierApi';
import { WalletApi } from './adapters/input/WalletApi';
import { ConfigurationImpl, getDI } from './di/cloudflare';

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
  .route('/', verifierApi.route)
  .route('/', walletApi.route);

// Export for DurableObject
export { PresentationDurableObject } from './adapters/out/persistence/PresentationDurableObject';
export default app;
