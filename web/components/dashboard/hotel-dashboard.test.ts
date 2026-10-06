import { describe, expect, it } from 'vitest';
import { getDashboardEndpoint } from './hotel-dashboard';

describe('getDashboardEndpoint', () => {
  it('routes overview pages to their canonical API paths', () => {
    expect(getDashboardEndpoint('overview')).toBe('/api/overview');
    expect(getDashboardEndpoint('revenue')).toBe('/api/revenue');
    expect(getDashboardEndpoint('demand')).toBe('/api/occupancy');
    expect(getDashboardEndpoint('bookings')).toBe('/api/bookings');
    expect(getDashboardEndpoint('customers')).toBe('/api/customers');
  });

  it('routes system pages to their canonical API paths', () => {
    expect(getDashboardEndpoint('data-health')).toBe('/api/system/data-health');
    expect(getDashboardEndpoint('models')).toBe('/api/system/models');
  });

  it('routes optimization pages to the pricing endpoint', () => {
    expect(getDashboardEndpoint('pricing')).toBe('/api/optimization/price');
    expect(getDashboardEndpoint('rooms')).toBe('/api/optimization/price');
    expect(getDashboardEndpoint('scenarios')).toBe('/api/optimization/price');
  });
});
