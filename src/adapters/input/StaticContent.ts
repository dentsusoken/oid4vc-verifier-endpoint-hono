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
import { Hono } from 'hono';

export class StaticContent {
  public route = new Hono().all('*', async (c, next) => {
    const acceptHeader = c.req.header('Accept');
    if (!acceptHeader || !acceptHeader.includes('text/html')) {
      await next();
    } else {
      return c.html('<h1>Verifier backend</h1>');
    }
  });
}
