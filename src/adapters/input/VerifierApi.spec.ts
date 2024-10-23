import { describe, expect, it, vi } from 'vitest';
import { VerifierApi } from './VerifierApi';
import { HonoConfiguration } from '../../di/HonoConfiguration';
import { Hono } from 'hono';

const now = new Date().toISOString();

const conf = new HonoConfiguration();
const mockKVNamespace = {
  get: vi.fn().mockResolvedValue(
    JSON.stringify({
      __type: 'Submitted',
      id: 'abc123',
      initiated_at: now,
      type: {
        __type: 'VpTokenRequest',
        presentation_definition: {
          id: 'id',
        },
      },
      request_id: 'def456',
      request_object_retrieved_at: now,
      submitted_at: now,
      wallet_response: {
        __type: 'IdToken',
        id_token: 'aa',
      },
      nonce: 'ghi789',
      response_code: 'efg',
    })
  ),
  put: vi.fn(),
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

describe('VerifierApi', () => {
  const api = new VerifierApi(
    conf.initTransactionPath(),
    conf.getWalletResponsePath(':transactionId')
  );
  const app = new Hono().route('/', api.route);

  describe('handleInitTransation', () => {
    it('should return 200', async () => {
      const res = await app.request(
        conf.initTransactionPath(),
        {
          method: 'POST',
          body: JSON.stringify({
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
          }),
        },
        mockEnv
      );

      expect(res.status).toBe(200);
      expect(mockEnv.PRESENTATION_KV.put).toHaveBeenCalled();
    });
  });
  describe('handleGetWalletResponse', () => {
    it('should return 200', async () => {
      const res = await app.request(
        `${conf.getWalletResponsePath(
          '3b75b9b1-2463-4d4a-b921-adc21642c43c'
        )}?response_code=efg`,
        {
          method: 'GET',
        },
        mockEnv
      );

      expect(res.status).toBe(200);
      expect(mockEnv.PRESENTATION_KV.get).toHaveBeenCalled();
    });
  });
});
