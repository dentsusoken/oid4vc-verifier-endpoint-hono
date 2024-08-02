import { describe, expect, it } from 'vitest';
import { StaticContent } from './StaticContent';
import { Hono } from 'hono';

describe('StaticContent', () => {
  it('should return html content', async () => {
    const staticContent = new StaticContent();
    const route = staticContent.route;
    const result = await route.request('/', {
      method: 'GET',
      headers: { Accept: 'text/html' },
    });
    expect(route).toBeDefined();
    expect(route).toBeInstanceOf(Hono);
    expect(await result.text()).toBe('<h1>Verifier backend</h1>');
  });
  it('should invoke next handler when Accept header dose not include "text/html"', async () => {
    const staticContent = new StaticContent();
    const route = staticContent.route.get('/get', (c) => {
      console.log('here');

      return c.html('<h1>This is mock</h1>');
    });
    const result = await route.request('/get', {
      method: 'GET',
    });
    expect(route).toBeDefined();
    expect(route).toBeInstanceOf(Hono);
    expect(await result.text()).toBe('<h1>This is mock</h1>');
  });
});
