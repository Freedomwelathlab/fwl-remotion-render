import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

export const hookOverlaySchema = z.object({
  kicker: z.string(),
  hook: z.string(),
  caption: z.string(),
  accent: z.enum(["mint", "gold"]),
});

type Props = z.infer<typeof hookOverlaySchema>;

const COLORS = {
  bg: "#0B0F14",
  ink: "#F5F7FA",
  mint: "#24E5A6",
  gold: "#F3C567",
  panel: "rgba(255,255,255,0.06)",
};

// Slow-drifting soft gradient blobs behind the copy, matching the
// "dynamic, graphical, digital" fintech-dark direction used on the site.
const Backdrop: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  const blob1X = 20 + Math.sin(t * 0.25) * 12;
  const blob1Y = 15 + Math.cos(t * 0.2) * 8;
  const blob2X = 75 + Math.cos(t * 0.18) * 10;
  const blob2Y = 78 + Math.sin(t * 0.22) * 8;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: `${blob1X}%`,
          top: `${blob1Y}%`,
          width: 620,
          height: 620,
          borderRadius: "50%",
          background: COLORS.mint,
          opacity: 0.16,
          filter: "blur(140px)",
          transform: "translate(-50%,-50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${blob2X}%`,
          top: `${blob2Y}%`,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: accent === "gold" ? COLORS.gold : COLORS.mint,
          opacity: 0.13,
          filter: "blur(140px)",
          transform: "translate(-50%,-50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${COLORS.panel} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.panel} 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          opacity: 0.35,
        }}
      />
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC<{ accentColor: string }> = ({ accentColor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress * 100}%`,
          backgroundColor: accentColor,
        }}
      />
    </div>
  );
};

const Kicker: React.FC<{ text: string; accentColor: string }> = ({
  text,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });

  return (
    <div
      style={{
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [-16, 0])}px)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: accentColor,
        }}
      />
      <span
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: accentColor,
        }}
      >
        {text}
      </span>
    </div>
  );
};

const Headline: React.FC<{ text: string; accentColor: string }> = ({
  text,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        rowGap: 6,
      }}
    >
      {words.map((word, i) => {
        const delay = 8 + i * 3;
        const enter = spring({
          frame: frame - delay,
          fps,
          config: { damping: 14, mass: 0.6 },
        });
        const isEmphasis = i === words.length - 1 || i === 0;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: 18,
              opacity: enter,
              transform: `translateY(${interpolate(
                enter,
                [0, 1],
                [40, 0],
              )}px) scale(${interpolate(enter, [0, 1], [0.9, 1])})`,
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.05,
              color: isEmphasis ? accentColor : COLORS.ink,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

const CaptionBar: React.FC<{ text: string; accentColor: string }> = ({
  text,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - 40,
    fps,
    config: { damping: 18, mass: 0.7 },
  });

  return (
    <div
      style={{
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [30, 0])}px)`,
        backgroundColor: COLORS.panel,
        borderLeft: `5px solid ${accentColor}`,
        borderRadius: 10,
        padding: "22px 28px",
        backdropFilter: "blur(6px)",
      }}
    >
      <span
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 36,
          fontWeight: 500,
          color: COLORS.ink,
          lineHeight: 1.35,
        }}
      >
        {text}
      </span>
    </div>
  );
};

const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 0.55], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 36,
        right: 40,
        opacity,
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: 2,
        color: COLORS.mint,
        textTransform: "uppercase",
      }}
    >
      Freedom Wealth Lab
    </div>
  );
};

export const HookOverlay: React.FC<Props> = ({
  kicker,
  hook,
  caption,
  accent,
}) => {
  const accentColor = accent === "gold" ? COLORS.gold : COLORS.mint;

  return (
    <AbsoluteFill>
      <Backdrop accent={accent} />
      <ProgressBar accentColor={accentColor} />
      <AbsoluteFill
        style={{
          padding: "160px 64px 100px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <Kicker text={kicker} accentColor={accentColor} />
          <Headline text={hook} accentColor={accentColor} />
        </div>
        <CaptionBar text={caption} accentColor={accentColor} />
      </AbsoluteFill>
      <Watermark />
    </AbsoluteFill>
  );
};
