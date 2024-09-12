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

export class HonoConfiguration extends AbstractConfiguration {
  #c?: Context<Env>;

  constructor(c?: Context<Env>) {
    super();
    this.#c = c;
  }

  jarSigningPrivateJwk = (): string =>
    this.#c?.env.JAR_SIGNING_PRIVATE_JWK || '';

  clientId = (): string => this.#c?.env.CLIENT_ID || '';

  clientIdSchemeName = (): ClientIdSchemeName =>
    this.#c?.env.CLIENT_ID_SCHEME || 'x509_san_dns';

  publicUrl = (): string => this.#c?.env.PUBLIC_URL || '';

  jarOptionName = (): EmbedOptionName => 'by_reference';

  responseModeOptionName = (): ResponseModeOptionName => 'direct_post.jwt';

  presentationDefinitionOptionName = (): EmbedOptionName => 'by_value';

  maxAge = (): Duration => DurationLuxon.Factory.ofMinutes(5);
}
