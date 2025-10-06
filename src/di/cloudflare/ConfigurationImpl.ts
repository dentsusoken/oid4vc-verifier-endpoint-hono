import { Context } from 'hono';
import { CloudflareEnv } from '../../env';
import { env } from 'hono/adapter';
import {
  AbstractConfiguration,
  EmbedOptionName,
  ResponseModeOptionName,
  Duration,
  DurationLuxon,
  ClientIdSchemeName,
} from '@vecrea/oid4vc-verifier-endpoint-core';

export class ConfigurationImpl extends AbstractConfiguration {
  readonly #env?: CloudflareEnv['Bindings'];

  constructor(c?: Context) {
    super();
    this.#env = c ? env<CloudflareEnv['Bindings']>(c) : undefined;
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

  frontendCorsOrigin = (): string => this.#env?.CORS_ORIGIN || '';
}
