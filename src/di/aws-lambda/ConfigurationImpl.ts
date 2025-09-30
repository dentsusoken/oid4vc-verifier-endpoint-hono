import { Context } from 'hono';
import { AwsEnv, AwsSecrets } from '../../env';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import {
  AbstractConfiguration,
  EmbedOptionName,
  ResponseModeOptionName,
  Duration,
  DurationLuxon,
  ClientIdSchemeName,
} from '@vecrea/oid4vc-verifier-endpoint-core';

export class ConfigurationImpl extends AbstractConfiguration {
  #secrets?: AwsSecrets;
  #dynamoDBClient?: DynamoDBDocumentClient;

  constructor(ctx?: Context<AwsEnv>) {
    super();
    this.#secrets = ctx?.env;
    this.#dynamoDBClient = ctx?.get('DynamoDBClient');
  }

  jarSigningPrivateJwk = (): string => {
    return this.#secrets?.JAR_SIGNING_PRIVATE_JWK || '';
  };

  clientId = (): string => {
    return this.#secrets?.CLIENT_ID || '';
  };

  clientIdSchemeName = (): ClientIdSchemeName => {
    return this.#secrets?.CLIENT_ID_SCHEME || 'x509_san_dns';
  };

  publicUrl = (): string => {
    return this.#secrets?.PUBLIC_URL || '';
  };

  jarOptionName = (): EmbedOptionName => 'by_reference';

  responseModeOptionName = (): ResponseModeOptionName => 'direct_post.jwt';

  presentationDefinitionOptionName = (): EmbedOptionName => 'by_value';

  maxAge = (): Duration => DurationLuxon.Factory.ofMinutes(5);

  frontendCorsOrigin = (): string => {
    return this.#secrets?.CORS_ORIGIN || '*';
  };

  dynamoDBClient(): DynamoDBDocumentClient {
    return DynamoDBDocumentClient.from(this.#dynamoDBClient!);
  }

  dynamoDBTable(): string {
    return (
      process.env.VerifierEndpointPresentationTable ??
      'oid4vc-verifier-endpoint-presentation-table'
    );
  }
}
