import { Context } from 'hono';
import { CloudflareEnv } from '../../env';
import {
  Configuration,
  PortsOutImpl as PortsOutImplCore,
  LoadPresentationById,
  LoadPresentationByRequestId,
  StorePresentation,
} from '@vecrea/oid4vc-verifier-endpoint-core';
import {
  createLoadPresentationById,
  createLoadPresentationByRequestId,
  createStorePresentation,
  PresentationDurableObject,
} from '../../adapters/out/persistence/PresentationDurableObject';

export class PortsOutImpl extends PortsOutImplCore {
  #presentationStub: DurableObjectStub<PresentationDurableObject>;

  /**
   * Creates an instance of HonoPortsOut.
   * @constructor
   * @param {Configuration} configuration - The configuration object.
   * @param {Context<CloudflareEnv>} c - The Hono context object.
   */
  constructor(configuration: Configuration, c: Context<CloudflareEnv>) {
    super(configuration);
    this.#presentationStub = c.env.PRESENTATION.get(
      c.env.PRESENTATION.idFromName('presentation')
    );
  }

  /**
   * Returns a function to load a presentation by its ID.
   * @returns {LoadPresentationById} A function to load a presentation by ID.
   */
  loadPresentationById = (): LoadPresentationById =>
    createLoadPresentationById(this.#presentationStub);

  /**
   * Returns a function to load a presentation by its request ID.
   * @returns {LoadPresentationByRequestId} A function to load a presentation by request ID.
   */
  loadPresentationByRequestId = (): LoadPresentationByRequestId =>
    createLoadPresentationByRequestId(
      this.#presentationStub,
      this.loadPresentationById()
    );

  /**
   * Returns a function to store a presentation.
   * @returns {StorePresentation} A function to store a presentation.
   */
  storePresentation = (): StorePresentation =>
    createStorePresentation(this.#presentationStub);
}
