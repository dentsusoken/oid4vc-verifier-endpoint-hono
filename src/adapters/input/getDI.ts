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
  Configuration,
  PortsOut,
  PortsInput,
  PortsInputImpl,
} from 'oid4vc-verifier-endpoint-core';
import { Env } from '../../env';
import { HonoConfiguration } from '../../di/HonoConfiguration';
import { HonoPortsOut } from '../../di/HonoPortsOut';

/**
 * Represents the result type of the dependency injection.
 * @typedef {Object} ResultType
 * @property {Configuration} configuration - The configuration object.
 * @property {PortsOut} portsOut - The output ports object.
 * @property {PortsInput} portsInput - The input ports object.
 */
type ResultType = {
  configuration: Configuration;
  portsOut: PortsOut;
  portsInput: PortsInput;
};

/**
 * Sets up and returns the dependency injection container.
 * @function getDI
 * @param {Context<Env>} c - The Hono context object.
 * @returns {ResultType} An object containing the configuration, output ports, and input ports.
 *
 * @description
 * This function creates instances of HonoConfiguration, HonoPortsOut, and PortsInputImpl,
 * wiring them together to form the dependency injection setup.
 *
 * @example
 * const { configuration, portsOut, portsInput } = getDI(context);
 */
export const getDI = (c: Context<Env>): ResultType => {
  const configuration = new HonoConfiguration(c);
  const portsOut = new HonoPortsOut(configuration, c);
  const portsInput = new PortsInputImpl(configuration, portsOut);

  return { configuration, portsOut, portsInput };
};
