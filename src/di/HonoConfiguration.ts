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
