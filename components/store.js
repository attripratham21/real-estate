// Shared mutable state between the DOM and the 3D scene (no re-renders needed)
export const ui = { target: 0, value: 0, mx: 0, my: 0, px: 0, py: 0, base: '#ffffff', hover: null, time: null };
export const FACADES = [
  { n: 'Clear glass', c: '#ffffff' },
  { n: 'Bronze glass', c: '#d9b48a' },
  { n: 'Graphite glass', c: '#7a8088' },
  { n: 'Emerald glass', c: '#8fc4ae' },
];
export const CHAPTERS = ['Arrival', 'The tower', 'Sky terrace', 'Evening'];
