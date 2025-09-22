import { ClientIdSchemeName } from '@vecrea/oid4vc-verifier-endpoint-core';
import { LambdaEvent, LambdaContext } from 'hono/aws-lambda';
import { PresentationDurableObject } from './adapters/out/persistence/PresentationDurableObject';

export type BaseBindings = {
  JAR_SIGNING_PRIVATE_JWK: string;
  CLIENT_ID: string;
  CLIENT_ID_SCHEME: ClientIdSchemeName;
  PUBLIC_URL: string;
  CORS_ORIGIN?: string;
};

export type CloudflareBindings = BaseBindings & {
  PRESENTATION: DurableObjectNamespace<PresentationDurableObject>;
};

export type AwsSecrets = BaseBindings & {
  DYNAMODB_ENDPOINT?: string;
  DYNAMODB_TABLE: string;
};

export type AwsBindings = {
  event: LambdaEvent;
  lambdaContext: LambdaContext;
};

export type Bindings = CloudflareBindings | AwsBindings;

export type CloudflareEnv = {
  Bindings: CloudflareBindings;
};

export type AwsEnv = {
  Bindings: AwsBindings;
};

export type Env = CloudflareEnv | AwsEnv;
