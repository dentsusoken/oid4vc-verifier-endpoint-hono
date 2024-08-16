import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './env';
import { VerifierApi } from './adapters/input/VerifierApi';
import { WalletApi } from './adapters/input/WalletApi';

const verifierApi = new VerifierApi();
const walletApi = new WalletApi({} as any, {} as any);

const app = new Hono<Env>()
  .use('*', (c, next) => cors({ origin: c.env.CORS_ORIGIN })(c, next))
  .route('/', verifierApi.route)
  .route('/', walletApi.route);

export default app;
