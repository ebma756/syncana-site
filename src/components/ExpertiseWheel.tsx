"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";

import { syncana360Steps, type Locale } from "@/data/site";

const WHEEL_SIZE = 520;
const CENTER = WHEEL_SIZE / 2;
const OUTER_RADIUS = 210;
const INNER_RADIUS = 122;
const SEGMENT_GAP = 4;
const START_ANGLE = -112;
const GEOMETRY_PRECISION = 3;
const WHEEL_ITEMS = syncana360Steps;

function normalizeNumber(value: number) {
  return Number(value.toFixed(GEOMETRY_PRECISION));
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle - 90) * (Math.PI / 180);

  return {
    x: normalizeNumber(cx + radius * Math.cos(radians)),
    y: normalizeNumber(cy + radius * Math.sin(radians)),
  };
}

function describeArcPath(startAngle: number, endAngle: number) {
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

function segmentMidpoint(index: number) {
  const segmentAngle = 360 / WHEEL_ITEMS.length;
  const segmentStart = normalizeNumber(START_ANGLE + index * segmentAngle + SEGMENT_GAP / 2);
  const segmentEnd = normalizeNumber(
    START_ANGLE + (index + 1) * segmentAngle - SEGMENT_GAP / 2,
  );
  const mid = normalizeNumber((segmentStart + segmentEnd) / 2);
  const point = polarToCartesian(CENTER, CENTER, (OUTER_RADIUS + INNER_RADIUS) / 2, mid);

  return {
    angle: mid,
    point,
  };
}

function splitLabel(label: string) {
  const words = label.split(" ");

  if (words.length <= 2) {
    return words;
  }

  if (words.length === 3) {
    return [words.slice(0, 2).join(" "), words[2]];
  }

  if (words.length === 4) {
    return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
  }

  return [words.slice(0, 2).join(" "), words.slice(2, 4).join(" "), words.slice(4).join(" ")];
}

type ExpertiseWheelProps = {
  locale: Locale;
};

export function ExpertiseWheel({ locale }: ExpertiseWheelProps) {
  const sectionId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lockedIndex, setLockedIndex] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const desktopMedia = window.matchMedia("(min-width: 981px)");
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateDesktop = () => setIsDesktop(desktopMedia.matches);
    const updateReducedMotion = () => setPrefersReducedMotion(reducedMotionMedia.matches);

    updateDesktop();
    updateReducedMotion();

    desktopMedia.addEventListener("change", updateDesktop);
    reducedMotionMedia.addEventListener("change", updateReducedMotion);

    return () => {
      desktopMedia.removeEventListener("change", updateDesktop);
      reducedMotionMedia.removeEventListener("change", updateReducedMotion);
    };
  }, []);

  const activateSegment = useEffectEvent((index: number) => {
    setActiveIndex(index);
  });

  useEffect(() => {
    if (!isDesktop || prefersReducedMotion || lockedIndex !== null) {
      return;
    }

    const interval = window.setInterval(() => {
      activateSegment((activeIndex + 1) % WHEEL_ITEMS.length);
    }, 2600);

    return () => {
      window.clearInterval(interval);
    };
  }, [activeIndex, isDesktop, lockedIndex, prefersReducedMotion]);

  function handleMouseEnter(index: number) {
    if (!isDesktop) {
      return;
    }

    setActiveIndex(index);
  }

  function handleClick(index: number) {
    setActiveIndex(index);
    setLockedIndex(index);
  }

  function handleWheelLeave() {
    if (!isDesktop) {
      return;
    }

    setLockedIndex(null);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;

    if (!nextTarget || !wheelRef.current?.contains(nextTarget as Node)) {
      setLockedIndex(null);
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<SVGGElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick(index);
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setLockedIndex(null);
      setActiveIndex((index + 1) % WHEEL_ITEMS.length);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setLockedIndex(null);
      setActiveIndex((index - 1 + WHEEL_ITEMS.length) % WHEEL_ITEMS.length);
    }
  }

  const activeStep = WHEEL_ITEMS[activeIndex];

  return (
    <section className="content-section expertise-wheel-section">
      <div className="container">
        <div className="section-heading section-heading--center">
          <span className="eyebrow">{locale === "en" ? "Our Process" : "O Nosso Processo"}</span>
          <h2>
            {locale === "en" ? (
              <>
                <span>Improve your Business Operations with Our Proprietary Process:</span>
                <span className="expertise-wheel__heading-accent">Syncana 360°</span>
              </>
            ) : (
              <>
                <span>Melhore as Operações do Seu Negócio com o Nosso Processo Proprietário:</span>
                <span className="expertise-wheel__heading-accent">Syncana 360°</span>
              </>
            )}
          </h2>
          <p>
            {locale === "en"
              ? "Explore the five stages of the Syncana 360° method to see how we assess, plan, implement, support, and continuously improve your technology environment."
              : "Explore as cinco etapas do método Syncana 360° para ver como avaliamos, planeamos, implementamos, suportamos e melhoramos continuamente o seu ambiente tecnológico."}
          </p>
        </div>

        <div
          ref={wheelRef}
          className="expertise-wheel"
          onBlur={handleBlur}
          onMouseLeave={handleWheelLeave}
        >
          <div className="expertise-wheel__stage">
            <svg
              aria-labelledby={`${sectionId}-title ${sectionId}-desc`}
              className="expertise-wheel__svg"
              role="img"
              viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
            >
              <title id={`${sectionId}-title`}>
                {locale === "en"
                  ? "Syncana 360 degree process wheel"
                  : "Roda do processo Syncana 360 graus"}
              </title>
              <desc id={`${sectionId}-desc`}>
                {locale === "en"
                  ? "An interactive wheel showing the five stages of the Syncana 360 degree operational process."
                  : "Uma roda interativa com as cinco etapas do processo operacional Syncana 360 graus."}
              </desc>

              <circle className="expertise-wheel__base" cx={CENTER} cy={CENTER} r={OUTER_RADIUS + 10} />
              <circle className="expertise-wheel__inner-ring" cx={CENTER} cy={CENTER} r={INNER_RADIUS - 12} />

              {WHEEL_ITEMS.map((step, index) => {
                const segmentAngle = 360 / WHEEL_ITEMS.length;
                const startAngle = normalizeNumber(
                  START_ANGLE + index * segmentAngle + SEGMENT_GAP / 2,
                );
                const endAngle = normalizeNumber(
                  START_ANGLE + (index + 1) * segmentAngle - SEGMENT_GAP / 2,
                );
                const path = describeArcPath(startAngle, endAngle);
                const { angle, point } = segmentMidpoint(index);
                const isActive = index === activeIndex;
                const rotation = normalizeNumber(
                  angle + (angle > 90 && angle < 270 ? 180 : 0),
                );
                const labelLines = splitLabel(step.wheelLabel[locale]);
                const lineOffset = labelLines.length === 1 ? 0 : labelLines.length === 2 ? -10 : -22;

                return (
                  <g
                    aria-pressed={lockedIndex === index}
                    key={step.key}
                    aria-label={step.panelTitle[locale]}
                    className={`expertise-wheel__segment ${isActive ? "is-active" : ""}`}
                    onClick={() => handleClick(index)}
                    onFocus={() => setActiveIndex(index)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onMouseEnter={() => handleMouseEnter(index)}
                    role="button"
                    tabIndex={0}
                  >
                    <path className="expertise-wheel__segment-fill" d={path} />
                    <path className="expertise-wheel__segment-stroke" d={path} />
                    <text
                      className="expertise-wheel__label"
                      textAnchor="middle"
                      transform={`translate(${point.x} ${point.y}) rotate(${rotation})`}
                    >
                      {labelLines.map((line, lineIndex) => (
                        <tspan key={`${step.key}-${line}`} x="0" y={lineOffset + lineIndex * 24}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="expertise-wheel__center">
              <h3>Syncana 360°</h3>
            </div>

            <div className="expertise-wheel__orbit-caps">
              {activeStep.orbitCaps[locale].map((capability, index) => (
                <span
                  key={capability}
                  className={`expertise-wheel__orbit-chip expertise-wheel__orbit-chip--${index + 1}`}
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>

          <aside className="expertise-wheel__panel" aria-live="polite">
            <span className="eyebrow">
              {locale === "en" ? "Process detail" : "Detalhe do processo"}
            </span>
            <div className="expertise-wheel__panel-title">
              <span className="expertise-wheel__panel-step">{activeStep.step}</span>
              <h3>{activeStep.panelTitle[locale]}</h3>
            </div>
            <p>{activeStep.panelDescription[locale]}</p>

            <div className="expertise-wheel__capability-grid">
              {activeStep.panelBullets[locale].map((bullet) => (
                <span key={bullet}>{bullet}</span>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
