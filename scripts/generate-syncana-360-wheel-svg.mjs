import fs from "node:fs";
import path from "node:path";

// Keep these in sync with src/components/ExpertiseWheel.tsx
const WHEEL_SIZE = 520;
const CENTER = WHEEL_SIZE / 2;
const OUTER_RADIUS = 210;
const INNER_RADIUS = 122;
const SEGMENT_GAP = 4;
const START_ANGLE = -112;
const GEOMETRY_PRECISION = 3;

const WHEEL_ITEMS = [
  { key: "discovery", label: "Discovery" },
  { key: "planning", label: "Planning" },
  { key: "onboarding", label: "Onboarding" },
  { key: "support", label: "Ongoing Support" },
  { key: "review", label: "Continuous Review" },
];

const fills = ["#2562c2", "#ecd575", "#3d7be0", "#173f80", "#2c5cad"];

function normalizeNumber(value) {
  return Number(value.toFixed(GEOMETRY_PRECISION));
}

function polarToCartesian(cx, cy, radius, angle) {
  const radians = (angle - 90) * (Math.PI / 180);
  return {
    x: normalizeNumber(cx + radius * Math.cos(radians)),
    y: normalizeNumber(cy + radius * Math.sin(radians)),
  };
}

function describeArcPath(startAngle, endAngle) {
  const outerStart = polarToCartesian(CENTER, CENTER, OUTER_RADIUS, endAngle);
  const outerEnd = polarToCartesian(CENTER, CENTER, OUTER_RADIUS, startAngle);
  const innerStart = polarToCartesian(CENTER, CENTER, INNER_RADIUS, startAngle);
  const innerEnd = polarToCartesian(CENTER, CENTER, INNER_RADIUS, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}

function segmentMidpoint(index) {
  const segmentAngle = 360 / WHEEL_ITEMS.length;
  const segmentStart = normalizeNumber(START_ANGLE + index * segmentAngle + SEGMENT_GAP / 2);
  const segmentEnd = normalizeNumber(START_ANGLE + (index + 1) * segmentAngle - SEGMENT_GAP / 2);
  const mid = normalizeNumber((segmentStart + segmentEnd) / 2);
  const point = polarToCartesian(CENTER, CENTER, (OUTER_RADIUS + INNER_RADIUS) / 2, mid);
  return { angle: mid, point };
}

function splitLabel(label) {
  const words = label.split(" ");
  if (words.length <= 2) return words;
  if (words.length === 3) return [words.slice(0, 2).join(" "), words[2]];
  if (words.length === 4) return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
  return [words.slice(0, 2).join(" "), words.slice(2, 4).join(" "), words.slice(4).join(" ")];
}

const segments = WHEEL_ITEMS.map((step, index) => {
  const segmentAngle = 360 / WHEEL_ITEMS.length;
  const startAngle = normalizeNumber(START_ANGLE + index * segmentAngle + SEGMENT_GAP / 2);
  const endAngle = normalizeNumber(START_ANGLE + (index + 1) * segmentAngle - SEGMENT_GAP / 2);
  const d = describeArcPath(startAngle, endAngle);
  const { angle, point } = segmentMidpoint(index);
  const rotation = normalizeNumber(angle + (angle > 90 && angle < 270 ? 180 : 0));
  const lines = splitLabel(step.label);
  const lineOffset = lines.length === 1 ? 0 : lines.length === 2 ? -10 : -22;

  const tspans = lines
    .map((line, lineIndex) => `<tspan x="0" y="${lineOffset + lineIndex * 24}">${line}</tspan>`)
    .join("");

  return {
    key: step.key,
    d,
    fill: fills[index] ?? "#2562c2",
    label: `<text text-anchor="middle" transform="translate(${point.x} ${point.y}) rotate(${rotation})">${tspans}</text>`,
  };
});

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WHEEL_SIZE}" height="${WHEEL_SIZE}" viewBox="0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}" role="img" aria-label="Syncana 360 wheel">
  <defs>
    <style>
      .base { fill: rgba(255,255,255,0.92); }
      .inner { fill: rgba(255,255,255,0.94); stroke: rgba(37,98,194,0.16); stroke-width: 2; }
      .seg-stroke { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 1.5; }
      text { fill: rgba(255,255,255,0.96); font-family: "Space Grotesk", system-ui, -apple-system, sans-serif; font-size: 16px; font-weight: 700; letter-spacing: -0.03em; }
      .seg-2 text { fill: rgba(15,30,62,0.92); }
    </style>
  </defs>

  <circle class="base" cx="${CENTER}" cy="${CENTER}" r="${OUTER_RADIUS + 10}" />
  <circle class="inner" cx="${CENTER}" cy="${CENTER}" r="${INNER_RADIUS - 12}" />

  ${segments
    .map((seg, index) => {
      const groupClass = index === 1 ? "seg-2" : "";
      return `<g class="${groupClass}">
    <path d="${seg.d}" fill="${seg.fill}" opacity="0.92" />
    <path class="seg-stroke" d="${seg.d}" />
    ${seg.label}
  </g>`;
    })
    .join("\n  ")}
</svg>
`;

const outDir = path.join(process.cwd(), "public", "svgs");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "syncana-360-wheel.svg");
fs.writeFileSync(outFile, svg, "utf8");
console.log(`Wrote ${outFile}`);

