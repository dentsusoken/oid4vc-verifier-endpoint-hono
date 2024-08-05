import { describe, expect, it, vi } from 'vitest';
import { VerifierApi } from './VerifierApi';
import {
  GetPresentationEvents,
  GetWalletResponse,
  InitTransaction,
  JwtSecuredAuthorizationRequestTO,
  PresentationEventsTO,
  QueryResponse,
  WalletResponseTO,
} from '../../mock/endpoint-core';

const mockInitTransaction: InitTransaction = {
  invoke: vi.fn().mockRejectedValue({
    clientId: 'client_id',
    request: 'request',
    requestUri: 'request_uri',
    transactionId: 'transaction_id',
  } as JwtSecuredAuthorizationRequestTO),
};
const mockGetWalletResponse: GetWalletResponse = {
  invoke: vi.fn().mockReturnValue({
    events: 'evemts',
    last_updated: 'last_updated',
    nonce: 'nonce',
    transaction_id: 'transaction_id',
  } as WalletResponseTO),
};
const mockGetPresentationEvents: GetPresentationEvents = {
  invoke: vi.fn().mockReturnValue(
    new QueryResponse.Found({
      transaction_id: 'transaction_id',
      last_updated: 'last_updated',
      events: 'events',
      nonce: 'nonce',
    }) as QueryResponse<PresentationEventsTO>
  ),
};

describe('VerifierApi', () => {
  const verifierApi = new VerifierApi(
    mockInitTransaction,
    mockGetWalletResponse,
    mockGetPresentationEvents
  ).route;
  describe('handleInitTransation', () => {
    it('should return 200', async () => {
      const response = await verifierApi.request('/ui/presentations', {
        method: 'POST',
        body: JSON.stringify({
          nonce: 'nonce',
        }),
      });
      expect(response.status).toBe(200);
    });
    it('should return 400 when parameter is invalid', async () => {
      const response = await verifierApi.request('/ui/presentations', {
        method: 'POST',
      });
      expect(response.status).toBe(400);
    });
    it('should return 400 when InitTransaction port return nullable value', async () => {
      const verifierApi = new VerifierApi(
        {
          invoke: vi.fn(),
        },
        mockGetWalletResponse,
        mockGetPresentationEvents
      ).route;
      const response = await verifierApi.request('/ui/presentations', {
        method: 'POST',
        body: JSON.stringify({
          nonce: 'nonce',
        }),
      });
      expect(response.status).toBe(400);
    });
  });
  describe('handleGetWalletResponse', () => {
    it('should return 200', async () => {
      const verifierApi = new VerifierApi(
        mockInitTransaction,
        {
          invoke: vi
            .fn()
            .mockReturnValue(
              new QueryResponse.Found(
                'response'
              ) as QueryResponse<WalletResponseTO>
            ),
        },
        mockGetPresentationEvents
      ).route;
      const response = await verifierApi.request(
        '/ui/presentations/transaction_id',
        {
          method: 'GET',
        }
      );
      expect(response.status).toBe(200);
    });
    it('should return 400 when getWalletResponse port return InvalidState', async () => {
      const verifierApi = new VerifierApi(
        mockInitTransaction,
        {
          invoke: vi.fn().mockReturnValue(new QueryResponse.InvalidState()),
        },
        mockGetPresentationEvents
      ).route;
      const response = await verifierApi.request(
        '/ui/presentations/transaction_id',
        {
          method: 'GET',
        }
      );
      expect(response.status).toBe(400);
    });
    it('should return 404 when getWalletResponse port return InvalidState', async () => {
      const verifierApi = new VerifierApi(
        mockInitTransaction,
        {
          invoke: vi.fn().mockReturnValue(new QueryResponse.NotFound()),
        },
        mockGetPresentationEvents
      ).route;
      const response = await verifierApi.request(
        '/ui/presentations/transaction_id',
        {
          method: 'GET',
        }
      );
      expect(response.status).toBe(404);
    });
  });
  describe('handleGetPresentationEvents', () => {
    it('should return 200', async () => {
      const response = await verifierApi.request(
        '/ui/presentations/transaction_id/events',
        {
          method: 'GET',
        }
      );
      expect(response.status).toBe(200);
    });
    it('should return 400 when getPresentationEvents port return InvalidState', async () => {
      const verifierApi = new VerifierApi(
        mockInitTransaction,
        mockGetWalletResponse,
        {
          invoke: vi.fn().mockReturnValue(new QueryResponse.InvalidState()),
        }
      ).route;
      const response = await verifierApi.request(
        '/ui/presentations/transaction_id/events',
        {
          method: 'GET',
        }
      );
      expect(response.status).toBe(400);
    });
    it('should return 404 when getPresentationEvents port return NotFound', async () => {
      const verifierApi = new VerifierApi(
        mockInitTransaction,
        mockGetWalletResponse,
        {
          invoke: vi.fn().mockReturnValue(new QueryResponse.NotFound()),
        }
      ).route;
      const response = await verifierApi.request(
        '/ui/presentations/transaction_id/events',
        {
          method: 'GET',
        }
      );
      expect(response.status).toBe(404);
    });
  });
});
