import { describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import { CompactEncrypt, decodeJwt, importJWK } from 'jose';
import { WalletApi } from './WalletApi';
import { VerifierApi } from './VerifierApi';
import { HonoConfiguration } from '../../di/HonoConfiguration';

const kvMock = new Map();

const mockKVNamespace = {
  get: (key: unknown) => kvMock.get(key),
  put: (key: unknown, value: unknown) => kvMock.set(key, value),
  delete: vi.fn(),
};

const mockEnv = {
  JAR_SIGNING_PRIVATE_JWK: process.env.JAR_SIGNING_PRIVATE_JWK,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_ID_SCHEME: process.env.CLIENT_ID_SCHEME,
  PUBLIC_URL: process.env.PUBLIC_URL,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  PRESENTATION_KV: mockKVNamespace,
};

const initTransactionPayload = {
  type: 'vp_token',
  presentation_definition: {
    id: '5db00636-73fb-425a-b5a3-482d26d0d602',
    input_descriptors: [
      {
        id: 'org.iso.18013.5.1.mDL',
        format: { mso_mdoc: { alg: ['ES256', 'ES384', 'ES512'] } },
        constraints: {
          fields: [
            {
              path: ["$['''org.iso.18013.5.1''']['''given_name''']"],
              intent_to_retain: false,
            },
          ],
        },
      },
    ],
  },
  nonce: '3b75b9b1-2463-4d4a-b921-adc21642c43c',
};

describe('WalletApi', () => {
  const conf = new HonoConfiguration();
  const walletApi = new WalletApi(
    conf.requestJWTPath(':requestId'),
    conf.presentationDefinitionPath(':requestId'),
    conf.walletResponsePath(),
    conf.getPublicJWKSetPath(),
    conf.jarmJWKSetPath(':requestId')
  );
  const verifierApi = new VerifierApi(
    conf.initTransactionPath(),
    conf.getWalletResponsePath(':transactionId')
  );
  const app = new Hono()
    .route('/', walletApi.route)
    .route('/', verifierApi.route);

  async function initTransaction() {
    const result = await app.request(
      conf.initTransactionPath(),
      {
        method: 'POST',
        body: JSON.stringify(initTransactionPayload),
      },
      mockEnv
    );
    const { request_uri: requestUri } = await result.json<{
      request_uri: string;
    }>();
    return requestUri.substring(requestUri.lastIndexOf('/') + 1);
  }

  describe('handleGetRequestObject', () => {
    it('should return 200', async () => {
      const requestId = await initTransaction();
      const res = await app.request(
        conf.requestJWTPath(requestId),
        { method: 'GET' },
        mockEnv
      );
      expect(res.status).toBe(200);
    });
  });

  describe('handlePostWalletResponse', () => {
    it('should return 200', async () => {
      const requestId = await initTransaction();
      const getRequestObjectResult = await app.request(
        conf.requestJWTPath(requestId),
        { method: 'GET' },
        mockEnv
      );

      const presentationSubmission = {
        id: 'submission-id-1',
        definition_id: 'definition-id-1',
        descriptor_map: [
          {
            id: 'input-descriptor-id-1',
            format: 'jwt_vc',
            path: '$.verifiableCredential[0]',
          },
        ],
      };

      const payload = {
        state: requestId,
        vp_token: 'vpToken',
        presentation_submission: presentationSubmission,
      };

      const jwt = await getRequestObjectResult.text();
      const { client_metadata } = decodeJwt<{
        client_metadata: { jwks: { keys: any[] } };
      }>(jwt);

      const enc = new CompactEncrypt(
        new TextEncoder().encode(JSON.stringify(payload))
      ).setProtectedHeader({ alg: 'ECDH-ES+A256KW', enc: 'A256GCM' });

      const publicKey = await importJWK(client_metadata.jwks.keys[0]);
      const jarm = await enc.encrypt(publicKey);

      const formData = new FormData();
      formData.append('response', jarm);
      formData.append('state', payload.state);

      const res = await app.request(
        conf.walletResponsePath(),
        { method: 'POST', body: formData },
        mockEnv
      );

      expect(res.status).toBe(200);
    });
  });
});
