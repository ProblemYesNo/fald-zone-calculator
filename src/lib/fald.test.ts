import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateZones } from './fald.ts';

const display = { diagonalInches: 27, widthPixels: 3840, heightPixels: 2160, zones: 576 };

test('4K / 576 zones yields an exact 32 × 18 grid of 120 × 120 pixel zones', () => {
  const result = calculateZones(display);
  assert.equal(result.columns, 32);
  assert.equal(result.rows, 18);
  assert.equal(result.zoneWidthPixels, 120);
  assert.equal(result.zoneHeightPixels, 120);
  assert.ok(Math.abs(Math.hypot(result.screenWidthInches, result.screenHeightInches) - 27) < 1e-10);
  assert.ok(Math.abs(result.zoneWidthInches * 32 - result.screenWidthInches) < 1e-10);
});

test('non-square and prime counts preserve the number of zones', () => {
  for (const zones of [1, 7, 100, 512, 1152]) {
    const result = calculateZones({ ...display, zones });
    assert.equal(result.columns * result.rows, zones);
    assert.equal(result.zoneWidthPixels * result.columns, display.widthPixels);
    assert.equal(result.zoneHeightPixels * result.rows, display.heightPixels);
  }
  const result = calculateZones({ ...display, zones: 512 });
  assert.equal(result.columns, 32);
  assert.equal(result.rows, 16);
  assert.equal(result.zoneHeightPixels, 135);
});

test('portrait displays use a portrait grid', () => {
  const result = calculateZones({ ...display, widthPixels: 2160, heightPixels: 3840 });
  assert.equal(result.columns, 18);
  assert.equal(result.rows, 32);
});

test('rejects invalid inputs and grids with subpixel zones', () => {
  for (const changes of [
    { diagonalInches: 0 }, { diagonalInches: Infinity }, { widthPixels: NaN },
    { heightPixels: -1 }, { widthPixels: 1920.5 }, { zones: 0 }, { zones: 1.5 },
    { zones: 3840 * 2160 + 1 }, { widthPixels: Number.MAX_SAFE_INTEGER },
    { widthPixels: 2, heightPixels: 2, zones: 3 },
  ]) {
    assert.throws(() => calculateZones({ ...display, ...changes }));
  }
});
