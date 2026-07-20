const a = 6378137.0;
const f = 1 / 298.257223563;
const e2 = 2 * f - f * f;
const k0 = 0.9996;

export function latLngToUtm(
  lat: number,
  lng: number,
  forceZone?: number,
): { zone: number; hemisphere: 'N' | 'S'; easting: number; northing: number } {
  const zone = forceZone ?? Math.floor((lng + 180) / 6) + 1;
  const phi = (lat * Math.PI) / 180;
  const lam = (lng * Math.PI) / 180;
  const lam0 = (((zone - 1) * 6 - 180 + 3) * Math.PI) / 180;
  const e2p = e2 / (1 - e2);
  const sp = Math.sin(phi);
  const cp = Math.cos(phi);
  const tp = Math.tan(phi);
  const N = a / Math.sqrt(1 - e2 * sp * sp);
  const T = tp * tp;
  const C = e2p * cp * cp;
  const A = cp * (lam - lam0);
  const A2 = A * A;
  const A3 = A2 * A;
  const A4 = A3 * A;
  const A5 = A4 * A;
  const A6 = A5 * A;
  const e4 = e2 * e2;
  const e6 = e4 * e2;
  const M =
    a *
    ((1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256) * phi -
      ((3 * e2) / 8 + (3 * e4) / 32 + (45 * e6) / 1024) * Math.sin(2 * phi) +
      ((15 * e4) / 256 + (45 * e6) / 1024) * Math.sin(4 * phi) -
      ((35 * e6) / 3072) * Math.sin(6 * phi));
  const easting =
    k0 * N * (A + ((1 - T + C) * A3) / 6 + ((5 - 18 * T + T * T + 72 * C - 58 * e2p) * A5) / 120) +
    500_000;
  const y =
    k0 *
    (M +
      N *
        tp *
        (A2 / 2 +
          ((5 - T + 9 * C + 4 * C * C) * A4) / 24 +
          ((61 - 58 * T + T * T + 600 * C - 330 * e2p) * A6) / 720));
  return {
    zone,
    hemisphere: lat >= 0 ? 'N' : 'S',
    easting,
    northing: lat < 0 ? y + 10_000_000 : y,
  };
}

export function utmToLatLng(
  zone: number,
  hemisphere: 'N' | 'S',
  easting: number,
  northing: number,
): { lat: number; lng: number } {
  const lam0 = (((zone - 1) * 6 - 180 + 3) * Math.PI) / 180;
  const x = easting - 500_000;
  const y = hemisphere === 'S' ? northing - 10_000_000 : northing;
  const e2p = e2 / (1 - e2);
  const e4 = e2 * e2;
  const e6 = e4 * e2;
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const e1_2 = e1 * e1;
  const e1_3 = e1_2 * e1;
  const e1_4 = e1_3 * e1;
  const M = y / k0;
  const mu = M / (a * (1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256));
  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1_3) / 32) * Math.sin(2 * mu) +
    ((21 * e1_2) / 16 - (55 * e1_4) / 32) * Math.sin(4 * mu) +
    ((151 * e1_3) / 96) * Math.sin(6 * mu) +
    ((1097 * e1_4) / 512) * Math.sin(8 * mu);
  const sp1 = Math.sin(phi1);
  const cp1 = Math.cos(phi1);
  const tp1 = Math.tan(phi1);
  const N1 = a / Math.sqrt(1 - e2 * sp1 * sp1);
  const T1 = tp1 * tp1;
  const C1 = e2p * cp1 * cp1;
  const R1 = (a * (1 - e2)) / Math.pow(1 - e2 * sp1 * sp1, 1.5);
  const D = x / (N1 * k0);
  const D2 = D * D;
  const D3 = D2 * D;
  const D4 = D3 * D;
  const D5 = D4 * D;
  const D6 = D5 * D;
  const lat =
    phi1 -
    ((N1 * tp1) / R1) *
      (D2 / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e2p) * D4) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e2p - 3 * C1 * C1) * D6) / 720);
  const lng =
    lam0 +
    (D -
      ((1 + 2 * T1 + C1) * D3) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e2p + 24 * T1 * T1) * D5) / 120) /
      cp1;
  return { lat: (lat * 180) / Math.PI, lng: (lng * 180) / Math.PI };
}

export function mgrsZone(lat: number, lng: number): { zone: number; band: string } {
  const zone = Math.floor((lng + 180) / 6) + 1;
  const band = 'CDEFGHJKLMNPQRSTUVWX'[Math.max(0, Math.min(Math.floor((lat + 80) / 8), 19))];
  return { zone, band };
}

export function mgrs100km(
  zone: number,
  easting: number,
  northing: number,
): { col: string; row: string } {
  const colSets = ['ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ'];
  const rowSet = 'ABCDEFGHJKLMNPQRSTUV';
  const col = colSets[(zone - 1) % 3][Math.floor(easting / 100_000) - 1];
  const rowOffset = zone % 2 === 0 ? 5 : 0;
  const rowIdx = (Math.floor(northing / 100_000) + rowOffset) % 20;
  return { col, row: rowSet[rowIdx] };
}
