import { Hono } from 'hono';
import { Env } from './env';
import { VerifierApi } from './adapters/input/VerifierApi';
import { WalletApi } from './adapters/input/WalletApi';

const verifierApi = new VerifierApi({} as any, {} as any);
const walletApi = new WalletApi({} as any, {} as any, {} as any, {} as any);

const app = new Hono<Env>()
  .route('/', verifierApi.route)
  .route('/', walletApi.route);

export default app;
