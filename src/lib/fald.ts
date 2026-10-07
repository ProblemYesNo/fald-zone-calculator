export interface DisplayInput {
  diagonalInches: number;
  widthPixels: number;
  heightPixels: number;
  zones: number;
}

export interface ZoneCalculation extends DisplayInput {
  columns: number;
  rows: number;
  screenWidthInches: number;
  screenHeightInches: number;
  zoneWidthPixels: number;
  zoneHeightPixels: number;
  zoneWidthInches: number;
  zoneHeightInches: number;
}

/** Estimate a uniform rectangular grid; a zone count cannot reveal the actual hardware layout. */
export function calculateZones(input: DisplayInput): ZoneCalculation {
  const { diagonalInches, widthPixels, heightPixels, zones } = input;
  if (!Number.isFinite(diagonalInches) || diagonalInches <= 0) {
    throw new Error('Enter a positive, finite screen diagonal.');
  }
  if (![widthPixels, heightPixels, zones].every(value => Number.isSafeInteger(value) && value > 0)) {
    throw new Error('Resolution and zone count must be positive whole numbers.');
  }
  const totalPixels = widthPixels * heightPixels;
  if (!Number.isSafeInteger(totalPixels) || zones > totalPixels) {
    throw new Error('Zone count cannot exceed the number of pixels; use a supported resolution.');
  }

  let columns = 0;
  let rows = 0;
  let bestScore = Infinity;
  const consider = (candidateColumns: number, candidateRows: number) => {
    if (candidateColumns > widthPixels || candidateRows > heightPixels) return;
    // Prefer zone shapes closest to square, while preserving the exact zone count.
    const score = Math.abs(Math.log((widthPixels / candidateColumns) / (heightPixels / candidateRows)));
    if (score < bestScore) {
      columns = candidateColumns;
      rows = candidateRows;
      bestScore = score;
    }
  };
  for (let divisor = 1; divisor <= Math.sqrt(zones); divisor++) {
    if (zones % divisor === 0) {
      consider(zones / divisor, divisor);
      consider(divisor, zones / divisor);
    }
  }
  if (!columns || !rows) {
    throw new Error('This zone count cannot form a uniform grid with at least one pixel per zone in each direction.');
  }

  const inchesPerPixel = diagonalInches / Math.hypot(widthPixels, heightPixels);
  const screenWidthInches = widthPixels * inchesPerPixel;
  const screenHeightInches = heightPixels * inchesPerPixel;
  if (![screenWidthInches, screenHeightInches].every(value => Number.isFinite(value) && value > 0)) {
    throw new Error('Screen dimensions are outside the supported numeric range.');
  }
  return {
    ...input,
    columns,
    rows,
    screenWidthInches,
    screenHeightInches,
    zoneWidthPixels: widthPixels / columns,
    zoneHeightPixels: heightPixels / rows,
    zoneWidthInches: screenWidthInches / columns,
    zoneHeightInches: screenHeightInches / rows,
  };
}
