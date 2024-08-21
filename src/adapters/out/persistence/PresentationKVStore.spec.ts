import { describe, it, expect } from 'vitest';

import { Miniflare } from 'miniflare';

import {
  TransactionId,
  RequestId,
  Presentation,
  Nonce,
  PresentationType,
  IdTokenType,
  EphemeralECDHPrivateJwk,
  ResponseModeOption,
  EmbedOption,
  GetWalletResponseMethod,
} from 'oid4vc-verifier-endpoint-core';
import { PresentationKVStore } from './PresentationKVStore';

describe('PresentationKVStore', () => {
  const id = new TransactionId('transaction-id');
  const initiatedAt = new Date('1970-01-01T00:00:00Z');
  const type = new PresentationType.IdTokenRequest([IdTokenType.SubjectSigned]);
  const requestId = new RequestId('request-id');
  const nonce = new Nonce('nonce');
  const ephemeralECDHPrivateJwk = new EphemeralECDHPrivateJwk(
    '{"kty":"EC","crv":"P-256","x":"example-x","y":"example-y","d":"example-d"}'
  );
  const responseMode = ResponseModeOption.DirectPostJwt;
  const presentationDefinitionMode = EmbedOption.ByValue.INSTANCE;
  const getWalletResponseMethod = new GetWalletResponseMethod.Redirect(
    'http://example.com/{requestId}'
  );
  const presentation = new Presentation.Requested(
    id,
    initiatedAt,
    type,
    requestId,
    nonce,
    ephemeralECDHPrivateJwk,
    responseMode,
    presentationDefinitionMode,
    getWalletResponseMethod
  );

  it('storePresentation & loadPresentationById', async () => {
    const mf = new Miniflare({
      modules: true,
      script: '',
      kvNamespaces: ['PRESENTATION_KV'],
    });
    const kv = (await mf.getKVNamespace('PRESENTATION_KV')) as KVNamespace;
    const store = new PresentationKVStore(kv);

    await store.storePresentation(presentation);
    const loaded = await store.loadPresentationById(id);
    expect(loaded).toEqual(presentation);
  });

  it('storePresentation & loadPresentationByRequestId', async () => {
    const mf = new Miniflare({
      modules: true,
      script: '',
      kvNamespaces: ['PRESENTATION_KV'],
    });
    const kv = (await mf.getKVNamespace('PRESENTATION_KV')) as KVNamespace;
    const store = new PresentationKVStore(kv);

    await store.storePresentation(presentation);
    const loaded = await store.loadPresentationByRequestId(requestId);
    expect(loaded).toEqual(presentation);
  });
});
