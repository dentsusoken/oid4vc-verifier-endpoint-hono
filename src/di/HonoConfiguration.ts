import { Context } from 'hono';
import {
  AbstractConfiguration,
  EmbedOptionName,
  ResponseModeOptionName,
  Duration,
  DurationLuxon,
  ClientIdSchemeName,
} from 'oid4vc-verifier-endpoint-core';
import { Env } from '../env';

const SINGING_PRIVATE_JWK_FOR_TEST_ONLY = JSON.stringify({
  kty: 'EC',
  crv: 'P-256',
  d: 'wDqDoFMSqffL8cKJ7YxdM1CQwhZfOGAzrbIDpuBTtJ4',
  x: 'ZL0M6r_Zw4YLfTIt2fsmOHPRObg_VG5gr1q0g3YwLVw',
  y: '68i6H_k3pqCIO8cX_JbPR2L2WvMs9Sqt_5Y0qeFOnHE',
  alg: 'ES256',
  use: 'sig',
  x5c: [
    'MIIBezCCASGgAwIBAgIUVKPkHWdXS+jHXnPhV7RCaIruxWYwCgYIKoZIzj0EAwIwEzERMA8GA1UEAwwIVmVyaWZpZXIwHhcNMjQwODE1MDIzODI0WhcNMjQwOTE0MDIzODI0WjATMREwDwYDVQQDDAhWZXJpZmllcjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABGS9DOq/2cOGC30yLdn7Jjhz0Tm4P1RuYK9atIN2MC1c68i6H/k3pqCIO8cX/JbPR2L2WvMs9Sqt/5Y0qeFOnHGjUzBRMB0GA1UdDgQWBBSaITaz+RRNpIphdEHUXBGqqBPZkjAfBgNVHSMEGDAWgBSaITaz+RRNpIphdEHUXBGqqBPZkjAPBgNVHRMBAf8EBTADAQH/MAoGCCqGSM49BAMCA0gAMEUCIF6mvmcDmAuf1uzIcWSD9bFlP47hN9egcj0iSydoUimwAiEAiQiWowbFf5GdfxKXv9SMF8bxkW8ClZ3hFW3CeKuM0/Q=',
  ],
  kid: 'e720016c-64f1-4326-b5a7-a00a34536951',
});

export class HonoConfiguration extends AbstractConfiguration {
  constructor(private c: Context<Env>) {
    super();
  }

  jarSigningPrivateJwk = (): string => this.c.env.JAR_SIGNING_PRIVATE_JWK;
  // jarSigningPrivateJwk = (): string => SINGING_PRIVATE_JWK_FOR_TEST_ONLY;

  clientId = (): string => this.c.env.CLIENT_ID;

  clientIdSchemeName = (): ClientIdSchemeName => this.c.env.CLIENT_ID_SCHEME;

  publicUrl = (): string => this.c.env.PUBLIC_URL;

  jarOptionName = (): EmbedOptionName => 'by_reference';

  responseModeOptionName = (): ResponseModeOptionName => 'direct_post.jwt';

  presentationDefinitionOptionName = (): EmbedOptionName => 'by_value';

  maxAge = (): Duration => DurationLuxon.Factory.ofMinutes(5);
}
