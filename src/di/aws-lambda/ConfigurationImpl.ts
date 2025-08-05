import { Context } from 'hono';
import { AwsEnv, AwsSecrets } from '../../env';
import SecretsManager from 'aws-sdk/clients/secretsmanager';
import { createDynamoDBClient } from '../../adapters/out/persistence/PresentationDynamoStore';
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

  constructor(_?: Context<AwsEnv>) {
    super();
  }

  async loadSecrets() {
    const secretsManager = new SecretsManager({
      region: process.env.AWS_REGION,
      endpoint: process.env.SECRETS_MANAGER_ENDPOINT,
    });

    const data = await secretsManager
      .getSecretValue({ SecretId: process.env.SECRETS_MANAGER_SECRET_ID || '' })
      .promise();

    this.#secrets = JSON.parse(data.SecretString ?? '{}');
  }

  jarSigningPrivateJwk = (): string => {
    if (!this.#secrets) {
      this.loadSecrets();
    }
    return this.#secrets?.JAR_SIGNING_PRIVATE_JWK || '';
  };

  clientId = (): string => {
    if (!this.#secrets) {
      this.loadSecrets();
    }
    return this.#secrets?.CLIENT_ID || '';
  };

  clientIdSchemeName = (): ClientIdSchemeName => {
    if (!this.#secrets) {
      this.loadSecrets();
    }
    return this.#secrets?.CLIENT_ID_SCHEME || 'x509_san_dns';
  };

  publicUrl = (): string => {
    if (!this.#secrets) {
      this.loadSecrets();
    }
    return this.#secrets?.PUBLIC_URL || '';
  };

  jarOptionName = (): EmbedOptionName => 'by_reference';

  responseModeOptionName = (): ResponseModeOptionName => 'direct_post.jwt';

  presentationDefinitionOptionName = (): EmbedOptionName => 'by_value';

  maxAge = (): Duration => DurationLuxon.Factory.ofMinutes(5);

  frontendCorsOrigin = (): string => {
    if (!this.#secrets) {
      this.loadSecrets();
    }
    return this.#secrets?.CORS_ORIGIN || '';
  };

  dynamoDBClient(): DynamoDBDocumentClient {
    if (!this.#secrets) {
      this.loadSecrets();
    }
    return createDynamoDBClient(
      this.#secrets?.DYNAMODB_ENDPOINT,
      process.env.AWS_REGION
    );
  }

  dynamoDBTable(): string {
    if (!this.#secrets) {
      this.loadSecrets();
    }
    return this.#secrets?.DYNAMODB_TABLE ?? '';
  }
}
