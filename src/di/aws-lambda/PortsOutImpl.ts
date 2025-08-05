import { Context } from 'hono';
import { AwsEnv } from '../../env';
import {
  PortsOutImpl as PortsOutImplCore,
  LoadPresentationById,
  LoadPresentationByRequestId,
  StorePresentation,
} from '@vecrea/oid4vc-verifier-endpoint-core';
import { DynamoDB } from '@vecrea/oid4vc-core';
import { PresentationDynamoStore } from '../../adapters/out/persistence/PresentationDynamoStore';
import { ConfigurationImpl } from './ConfigurationImpl';

export class PortsOutImpl extends PortsOutImplCore {
  #presentationDynamoStore: PresentationDynamoStore;

  /**
   * Creates an instance of LambdaPortsOut.
   * @constructor
   * @param {Configuration} configuration - The configuration object.
   * @param {Context<Env>} c - The Hono context object.
   */
  constructor(configuration: ConfigurationImpl, c: Context<AwsEnv>) {
    super(configuration);
    const client = configuration.dynamoDBClient();
    const dynamo = new DynamoDB(client, configuration.dynamoDBTable());
    this.#presentationDynamoStore = new PresentationDynamoStore(dynamo);
  }

  /**
   * Returns a function to load a presentation by its ID.
   * @returns {LoadPresentationById} A function to load a presentation by ID.
   */
  loadPresentationById = (): LoadPresentationById =>
    this.#presentationDynamoStore.loadPresentationById;

  /**
   * Returns a function to load a presentation by its request ID.
   * @returns {LoadPresentationByRequestId} A function to load a presentation by request ID.
   */
  loadPresentationByRequestId = (): LoadPresentationByRequestId =>
    this.#presentationDynamoStore.loadPresentationByRequestId;

  /**
   * Returns a function to store a presentation.
   * @returns {StorePresentation} A function to store a presentation.
   */
  storePresentation = (): StorePresentation =>
    this.#presentationDynamoStore.storePresentation;
}
