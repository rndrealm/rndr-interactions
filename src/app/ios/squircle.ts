// corner-shape: squircle gives Apple's continuous corners (Chromium 139+).
// A squircle looks tighter than a circular corner of the same radius, so the
// radii are set larger. Browsers without it (Safari, Firefox) get a plain round
// corner at ~0.6x, which looks about the same, via supports-[corner-shape:…].
export const SQUIRCLE = "[corner-shape:squircle]";
