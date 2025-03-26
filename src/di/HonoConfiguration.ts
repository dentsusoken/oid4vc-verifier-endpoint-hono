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
import { env } from 'hono/adapter';

export class HonoConfiguration extends AbstractConfiguration {
  #env?: Env['Bindings'];

  constructor(c?: Context) {
    super();
    this.#env = c ? env<Env['Bindings']>(c) : undefined;
  }

  jarSigningPrivateJwk = (): string => this.#env?.JAR_SIGNING_PRIVATE_JWK || '';

  clientId = (): string => this.#env?.CLIENT_ID || '';

  clientIdSchemeName = (): ClientIdSchemeName =>
    this.#env?.CLIENT_ID_SCHEME || 'x509_san_dns';

  publicUrl = (): string => this.#env?.PUBLIC_URL || '';

  jarOptionName = (): EmbedOptionName => 'by_reference';

  responseModeOptionName = (): ResponseModeOptionName => 'direct_post.jwt';

  presentationDefinitionOptionName = (): EmbedOptionName => 'by_value';

  maxAge = (): Duration => DurationLuxon.Factory.ofMinutes(5);

  frontendCorsOrigin = (): string =>
    'https://oid4vc-verifier-frontend-hono.g-trustedweb.workers.dev';
}
