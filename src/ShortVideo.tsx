import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

const sceneSchema = z.object({
  src: z.string(),
  durationInSeconds: z.number(),
});

const captionSchema = z.object({
  text: z.string(),
  startSeconds: z.number(),
  durationSeconds: z.number(),
});

export const shortVideoSchema = z.object({
  scenes: z.array(sceneSchema).min(1),
  voiceoverFile: z.string().optional(),
  hookText: z.string(),
  hookDurationSeconds: z.number().default(4),
  captions: z.array(captionSchema).default([]),
  disclaimerStartSeconds: z.number(),
  disclaimerDurationSeconds: z.number().default(4),
  accent: z.enum(["mint", "gold"]).default("gold"),
});

type Props = z.infer<typeof shortVideoSchema>;

const COLORS = {
  ink: "#F5F7FA",
  mint: "#24E5A6",
  gold: "#F3C567",
};

export const calculateShortVideoMetadata = ({ props }: { props: Props }) => {
  const fps = 30;
  const totalSeconds = props.scenes.reduce(
    (sum, s) => sum + s.durationInSeconds,
    0,
  );
  return {
    fps,
    durationInFrames: Math.max(1, Math.round(totalSeconds * fps)),
  };
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.65) 100%)",
      pointerEvents: "none",
    }}
  />
);

const HookText: React.FC<{ text: string; accentColor: string }> = ({
  text,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = text.split("\n");

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "150px 56px 0",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lines.map((line, li) => {
          const words = line.split(" ");
          return (
            <div
              key={li}
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                rowGap: 4,
              }}
            >
              {words.map((word, i) => {
                const delay = 4 + (li * words.length + i) * 2.5;
                const enter = spring({
                  frame: frame - delay,
                  fps,
                  config: { damping: 14, mass: 0.55 },
                });
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      marginRight: 14,
                      opacity: enter,
                      transform: `translateY(${interpolate(enter, [0, 1], [26, 0])}px) scale(${interpolate(enter, [0, 1], [0.92, 1])})`,
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: 58,
                      fontWeight: 800,
                      lineHeight: 1.12,
                      color: COLORS.ink,
                      textShadow:
                        "0 2px 0 rgba(0,0,0,0.9), 0 0 22px rgba(0,0,0,0.55)",
                      WebkitTextStroke: `1.5px rgba(0,0,0,0.5)`,
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          );
        })}
        <div
          style={{
            marginTop: 14,
            height: 4,
            width: 64,
            borderRadius: 2,
            backgroundColor: accentColor,
            alignSelf: "center",
            opacity: interpolate(frame, [10, 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const CaptionBar: React.FC<{ text: string; accentColor: string }> = ({
  text,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, mass: 0.6 } });
  const exit = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 48px 190px",
      }}
    >
      <div
        style={{
          opacity: enter * exit,
          transform: `translateY(${interpolate(enter, [0, 1], [24, 0])}px)`,
          background: "rgba(10,12,10,0.72)",
          borderLeft: `5px solid ${accentColor}`,
          borderRadius: 10,
          padding: "20px 26px",
          backdropFilter: "blur(4px)",
          maxWidth: "100%",
        }}
      >
        <span
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 38,
            fontWeight: 700,
            color: COLORS.ink,
            lineHeight: 1.3,
            textAlign: "center",
            display: "block",
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};

const Disclaimer: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", padding: "0 40px 70px" }}
    >
      <div
        style={{
          opacity,
          background: "rgba(0,0,0,0.5)",
          borderRadius: 8,
          padding: "10px 18px",
        }}
      >
        <span
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 22,
            fontWeight: 600,
            color: "#F4F2EA",
            textAlign: "center",
          }}
        >
          Educational content only — not financial advice
        </span>
      </div>
    </AbsoluteFill>
  );
};

const Watermark: React.FC<{ accentColor: string }> = ({ accentColor }) => (
  <div
    style={{
      position: "absolute",
      bottom: 26,
      right: 34,
      opacity: 0.6,
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: 2,
      color: accentColor,
      textTransform: "uppercase",
      textShadow: "0 1px 2px rgba(0,0,0,0.8)",
    }}
  >
    Freedom Wealth Lab
  </div>
);

export const ShortVideo: React.FC<Props> = ({
  scenes,
  voiceoverFile,
  hookText,
  hookDurationSeconds,
  captions,
  disclaimerStartSeconds,
  disclaimerDurationSeconds,
  accent,
}) => {
  const { fps } = useVideoConfig();
  const accentColor = accent === "gold" ? COLORS.gold : COLORS.mint;

  let cursor = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0F14" }}>
      {scenes.map((scene, i) => {
        const from = Math.round(cursor * fps);
        const durationInFrames = Math.round(scene.durationInSeconds * fps);
        cursor += scene.durationInSeconds;
        return (
          <Sequence key={i} from={from} durationInFrames={durationInFrames}>
            <OffthreadVideo
              src={scene.src}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Sequence>
        );
      })}

      <Vignette />

      {voiceoverFile ? (
        <Audio src={staticFile(`audio/${voiceoverFile}`)} />
      ) : null}

      <Sequence from={0} durationInFrames={Math.round(hookDurationSeconds * fps)}>
        <HookText text={hookText} accentColor={accentColor} />
      </Sequence>

      {captions.map((c, i) => (
        <Sequence
          key={i}
          from={Math.round(c.startSeconds * fps)}
          durationInFrames={Math.round(c.durationSeconds * fps)}
        >
          <CaptionBar text={c.text} accentColor={accentColor} />
        </Sequence>
      ))}

      <Sequence
        from={Math.round(disclaimerStartSeconds * fps)}
        durationInFrames={Math.round(disclaimerDurationSeconds * fps)}
      >
        <Disclaimer />
      </Sequence>

      <Watermark accentColor={accentColor} />
    </AbsoluteFill>
  );
};
