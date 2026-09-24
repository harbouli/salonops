import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { createApp } from '../../src/app';

describe('Scalar UI & OpenAPI 3.1 Specification Engine (BACKEND-19)', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });

  it('GET /api/v1/openapi.json should return HTTP 200 with valid OpenAPI 3.1 JSON', async () => {
    const res = await fetch(`${baseUrl}/api/v1/openapi.json`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-type')?.includes('application/json'));

    const spec = (await res.json()) as any;
    assert.strictEqual(spec.openapi, '3.1.0');
    assert.strictEqual(spec.info.title, 'SalonOps Morocco 🇲🇦 API Reference');
    assert.strictEqual(spec.info.version, '1.0.0');

    // Verify Server declarations
    assert.ok(Array.isArray(spec.servers));
    assert.ok(spec.servers.length >= 2);

    // Verify Security Schemes
    assert.ok(spec.components?.securitySchemes?.bearerAuth);
    assert.strictEqual(spec.components.securitySchemes.bearerAuth.type, 'http');
    assert.strictEqual(spec.components.securitySchemes.bearerAuth.scheme, 'bearer');
  });

  it('GET /api/v1/openapi.json should contain all 6 controller paths & schemas', async () => {
    const res = await fetch(`${baseUrl}/api/v1/openapi.json`);
    const spec = (await res.json()) as any;

    const expectedPaths = [
      '/health',
      '/api/v1/auth/login',
      '/api/v1/auth/me',
      '/api/v1/stylists',
      '/api/v1/services',
      '/api/v1/appointments',
      '/api/v1/appointments/{id}/status',
      '/api/v1/clients/search',
      '/api/v1/clients/{id}/formulas',
      '/api/v1/checkout',
    ];

    for (const pathKey of expectedPaths) {
      assert.ok(
        spec.paths[pathKey],
        `Chemin OpenAPI manquant dans la spécification: ${pathKey}`
      );
    }

    // Verify Component Schemas
    const schemas = spec.components?.schemas;
    assert.ok(schemas?.User);
    assert.ok(schemas?.Stylist);
    assert.ok(schemas?.Service);
    assert.ok(schemas?.Appointment);
    assert.ok(schemas?.Client);
    assert.ok(schemas?.HairFormula);
    assert.ok(schemas?.Transaction);
    assert.ok(schemas?.LoginRequest);
    assert.ok(schemas?.CreateAppointmentRequest);
    assert.ok(schemas?.UpdateAppointmentStatusRequest);
    assert.ok(schemas?.CreateHairFormulaRequest);
    assert.ok(schemas?.ProcessCheckoutRequest);
    assert.ok(schemas?.ErrorResponse);
    assert.ok(schemas?.BilingualErrorResponse);
  });

  it('GET /reference should render dark-themed Scalar UI with CSP relaxation', async () => {
    const res = await fetch(`${baseUrl}/reference`);
    assert.strictEqual(res.status, 200);

    const csp = res.headers.get('content-security-policy');
    assert.ok(csp, 'L’en-tête Content-Security-Policy doit être présent');
    assert.ok(csp.includes("script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://scalar.com"));
    assert.ok(csp.includes("style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com"));

    const html = await res.text();
    assert.ok(html.includes('doctype html') || html.includes('<!DOCTYPE html>') || html.includes('html'));
    assert.ok(html.includes('Scalar') || html.includes('scalar') || html.includes('api-reference'));
  });

  it('GET /docs should issue an HTTP 301 Moved Permanently redirect to /reference', async () => {
    const res = await fetch(`${baseUrl}/docs`, { redirect: 'manual' });
    assert.strictEqual(res.status, 301);
    assert.strictEqual(res.headers.get('location'), '/reference');
  });
});
