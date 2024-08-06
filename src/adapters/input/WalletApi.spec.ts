import { describe, expect, it, vi } from 'vitest';
import { WalletApi } from './WalletApi';
import * as jose from 'jose';
import {
  GetJarmJwks,
  GetPresentationDefinition,
  GetRequestObject,
  PostWalletResponse,
  QueryResponse,
  RequestId,
  WalletResponseAcceptedTO,
} from '../../mock/endpoint-core';

const mockGetRequestObject: GetRequestObject = {
  invoke: vi.fn().mockReturnValue(new QueryResponse.Found('requestId')),
};
const mockGetPresentationDefinition: GetPresentationDefinition = {
  invoke: vi.fn().mockReturnValue(new QueryResponse.Found({})),
};
const mockPostWalletResponse: PostWalletResponse = {
  invoke: vi
    .fn()
    .mockReturnValue(new WalletResponseAcceptedTO('http://localhost:3000')),
};
const mockGetJarmJwks: GetJarmJwks = {
  invoke: vi.fn().mockReturnValue(new QueryResponse.Found('requestId')),
};

describe('WalletApi', async () => {
  const mockJWK: jose.JWK = await jose.exportJWK(
    (
      await jose.generateKeyPair('ES256', { extractable: true })
    ).publicKey
  );
  const walletApi = new WalletApi(
    mockGetRequestObject,
    mockGetPresentationDefinition,
    mockPostWalletResponse,
    mockGetJarmJwks,
    mockJWK
  ).route;

  describe('handleGetRequestObject', () => {
    it('should return 200', async () => {
      const response = await walletApi.request('/wallet/request.jwt/123', {
        method: 'GET',
      });
      expect(response.status).toBe(200);
    });
    it('should return 400 when getRequestObject port return InvalidState', async () => {
      const walletApi = new WalletApi(
        {
          invoke: vi.fn().mockReturnValue(new QueryResponse.InvalidState()),
        },
        mockGetPresentationDefinition,
        mockPostWalletResponse,
        mockGetJarmJwks,
        mockJWK
      ).route;
      const response = await walletApi.request('/wallet/request.jwt/123', {
        method: 'GET',
      });
      expect(response.status).toBe(400);
    });
    it('should return 404 when getRequestObject port return NotFound', async () => {
      const walletApi = new WalletApi(
        {
          invoke: vi.fn().mockReturnValue(new QueryResponse.NotFound()),
        },
        mockGetPresentationDefinition,
        mockPostWalletResponse,
        mockGetJarmJwks,
        mockJWK
      ).route;
      const response = await walletApi.request('/wallet/request.jwt/123', {
        method: 'GET',
      });
      expect(response.status).toBe(404);
    });
  });
  describe('handleGetPresentationDefinition', () => {
    it('should return 200', async () => {
      const response = await walletApi.request('/wallet/pd/123', {
        method: 'GET',
      });
      expect(response.status).toBe(200);
    });
    it('should return 400 when getPresentationDefinition port return InvalidState', async () => {
      const walletApi = new WalletApi(
        mockGetRequestObject,
        {
          invoke: vi.fn().mockReturnValue(new QueryResponse.InvalidState()),
        },
        mockPostWalletResponse,
        mockGetJarmJwks,
        mockJWK
      ).route;
      const response = await walletApi.request('/wallet/pd/123', {
        method: 'GET',
      });
      expect(response.status).toBe(400);
    });
    it('should return 404 when getPresentationDefinition port return NotFound', async () => {
      const walletApi = new WalletApi(
        mockGetRequestObject,
        {
          invoke: vi.fn().mockReturnValue(new QueryResponse.NotFound()),
        },
        mockPostWalletResponse,
        mockGetJarmJwks,
        mockJWK
      ).route;
      const response = await walletApi.request('/wallet/pd/123', {
        method: 'GET',
      });
      expect(response.status).toBe(404);
    });
  });
  describe('handlePostWalletResponse', () => {
    it('should return 200', async () => {
      const formData = new FormData();
      formData.append(
        'walletResponse',
        JSON.stringify({
          state: 'state',
          response: 'jarm',
        })
      );
      const response = await walletApi.request('/wallet/direct_post', {
        method: 'POST',
        body: formData,
      });
      expect(response.status).toBe(200);
    });
    it('should return 200 when postWalletResponse port return nullable value', async () => {
      const walletApi = new WalletApi(
        mockGetRequestObject,
        mockGetPresentationDefinition,
        {
          invoke: vi.fn(),
        },
        mockGetJarmJwks,
        mockJWK
      ).route;
      const formData = new FormData();
      formData.append(
        'walletResponse',
        JSON.stringify({
          state: 'state',
          response: 'jarm',
        })
      );
      const response = await walletApi.request('/wallet/direct_post', {
        method: 'POST',
        body: formData,
      });
      expect(response.status).toBe(200);
    });
    it('should return 400 when postWalletResponse throw Error', async () => {
      const walletApi = new WalletApi(
        mockGetRequestObject,
        mockGetPresentationDefinition,
        {
          invoke: vi.fn().mockImplementation(() => {
            throw new Error();
          }),
        },
        mockGetJarmJwks,
        mockJWK
      ).route;
      const formData = new FormData();
      formData.append(
        'walletResponse',
        JSON.stringify({
          state: 'state',
          response: 'jarm',
        })
      );
      const response = await walletApi.request('/wallet/direct_post', {
        method: 'POST',
        body: formData,
      });
      expect(response.status).toBe(400);
    });
  });
  describe('handleGetPublicJwkSet', () => {
    it('should return 200', async () => {
      const response = await walletApi.request('/wallet/public-keys.json', {
        method: 'GET',
      });
      expect(response.status).toBe(200);
    });
  });
  describe('handleGetJarmJwks', () => {
    it('should return 200', async () => {
      const response = await walletApi.request('/wallet/jarm/:1234/jwks.json', {
        method: 'GET',
      });
      expect(response.status).toBe(200);
    });
    it('should return 404 when getJarmJwks port return NotFound', async () => {
      const walletApi = new WalletApi(
        mockGetRequestObject,
        mockGetPresentationDefinition,
        mockPostWalletResponse,
        {
          invoke: vi.fn().mockReturnValue(new QueryResponse.NotFound()),
        },
        mockJWK
      ).route;
      const response = await walletApi.request('/wallet/jarm/:1234/jwks.json', {
        method: 'GET',
      });
      expect(response.status).toBe(404);
    });
    it('should return 400 when getJarmJwks port return InvalidState', async () => {
      const walletApi = new WalletApi(
        mockGetRequestObject,
        mockGetPresentationDefinition,
        mockPostWalletResponse,
        {
          invoke: vi.fn().mockReturnValue(new QueryResponse.InvalidState()),
        },
        mockJWK
      ).route;
      const response = await walletApi.request('/wallet/jarm/:1234/jwks.json', {
        method: 'GET',
      });
      expect(response.status).toBe(400);
    });
  });
  describe('requestJwtByReference', () => {
    it('should return url builder', async () => {
      const urlBuilder = WalletApi.requestJwtByReference('https://example.com');

      expect(urlBuilder.value(new RequestId('1234'))).toBe(
        'https://example.com/wallet/request.jwt/1234'
      );
    });
  });
  describe('presentationDefinitionByReference', () => {
    it('should return url builder', async () => {
      const urlBuilder = WalletApi.presentationDefinitionByReference(
        'https://example.com'
      );

      expect(urlBuilder.value(new RequestId('1234'))).toBe(
        'https://example.com/wallet/pd/1234'
      );
    });
  });
  describe('publicJwkSet', () => {
    it('should return url builder', async () => {
      const urlBuilder = WalletApi.publicJwkSet('https://example.com');

      expect(urlBuilder).toBe('https://example.com/wallet/public-keys.json');
    });
  });
  describe('jarmJwksByReference', () => {
    it('should return url builder', async () => {
      const urlBuilder = WalletApi.jarmJwksByReference('https://example.com');

      expect(urlBuilder.value(new RequestId('1234'))).toBe(
        'https://example.com/wallet/public-keys.json'
      );
    });
    describe('directPost', () => {
      it('should return url builder', async () => {
        const urlBuilder = WalletApi.directPost('https://example.com');

        expect(urlBuilder).toBe('https://example.com/wallet/direct_post');
      });
    });
    describe('urlBuilder', () => {
      it('should return url builder', async () => {
        const urlBuilder = WalletApi.urlBuilder(
          'https://example.com',
          '/:requestId'
        );

        expect(urlBuilder.value(new RequestId('1234'))).toBe(
          'https://example.com/1234'
        );
      });
    });
  });
});
