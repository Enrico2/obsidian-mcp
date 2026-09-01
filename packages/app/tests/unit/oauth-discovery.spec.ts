import { afterEach, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { registerOAuthRoutes } from '@/server/shared/oauth-routes';
import { registerMcpRoute } from '@/server/shared/mcp-routes';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const BASE_URL = 'https://mcp.example.com';

function makeOAuthApp() {
  const app = express();
  registerOAuthRoutes(app, {
    clientId: 'test-client',
    clientSecret: 'test-secret',
    baseUrl: BASE_URL,
  });
  return app;
}

describe('OAuth discovery endpoints', () => {
  it.each(['/.well-known/oauth-authorization-server', '/.well-known/oauth-authorization-server/mcp'])(
    'serves authorization server metadata at %s',
    async path => {
      const res = await request(makeOAuthApp()).get(path);

      expect(res.status).toBe(200);
      expect(res.body.issuer).toBe(BASE_URL);
      expect(res.body.authorization_endpoint).toBe(`${BASE_URL}/oauth/authorize`);
      expect(res.body.token_endpoint).toBe(`${BASE_URL}/oauth/token`);
      expect(res.body.registration_endpoint).toBe(`${BASE_URL}/oauth/register`);
    },
  );

  it.each(['/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource/mcp'])(
    'serves protected resource metadata at %s',
    async path => {
      const res = await request(makeOAuthApp()).get(path);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        resource: `${BASE_URL}/mcp`,
        authorization_servers: [BASE_URL],
        bearer_methods_supported: ['header'],
        resource_name: 'obsidian-mcp',
      });
    },
  );
});

describe('MCP endpoint auth challenge', () => {
  const originalBaseUrl = process.env.BASE_URL;

  afterEach(() => {
    if (originalBaseUrl === undefined) {
      delete process.env.BASE_URL;
    } else {
      process.env.BASE_URL = originalBaseUrl;
    }
  });

  it('returns 401 with a WWW-Authenticate challenge pointing at resource metadata', async () => {
    process.env.BASE_URL = BASE_URL;

    const app = express();
    registerMcpRoute(app, {} as McpServer);

    const res = await request(app).post('/mcp').send({});

    expect(res.status).toBe(401);
    expect(res.headers['www-authenticate']).toBe(
      `Bearer resource_metadata="${BASE_URL}/.well-known/oauth-protected-resource/mcp"`,
    );
  });
});
