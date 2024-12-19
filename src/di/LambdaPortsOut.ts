/*
 * Copyright (c) 2023 European Commission
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Context } from 'hono';
import {
  PortsOutImpl,
  Configuration,
  LoadPresentationById,
  LoadPresentationByRequestId,
  StorePresentation,
} from 'oid4vc-verifier-endpoint-core';
import { PresentationKVStore } from '../adapters/out/persistence/PresentationKVStore';
import { Env } from '../env';
import { DynamoDB } from 'oid4vc-core/dynamodb';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PresentationDynamoStore } from '../adapters/out/persistence/PresentationDynamoStore';

export const createDynamoDBClient = (config?: DynamoDBClientConfig) => {
  const client = new DynamoDBClient({
    endpoint: process.env.DYNAMODB_ENDPOINT,
    region: process.env.AWS_REGION,
    ...config,
  });
  return DynamoDBDocumentClient.from(client);
};

/**
 * Represents the output ports for Hono framework integration.
 * @class
 * @extends PortsOutImpl
 */
export class LambdaPortsOut extends PortsOutImpl {
  #presentationDynamoStore: PresentationDynamoStore;

  /**
   * Creates an instance of LambdaPortsOut.
   * @constructor
   * @param {Configuration} configuration - The configuration object.
   * @param {Context<Env>} c - The Hono context object.
   */
  constructor(configuration: Configuration, c: Context<Env>) {
    super(configuration);
    const client = createDynamoDBClient({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    });
    const dynamo = new DynamoDB(client, process.env.TABLE_NAME ?? '');
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
