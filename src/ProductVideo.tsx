import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

export const productVideoSchema = z.object({
  productTitle: z.string(),
  hook: z.string(),
  caption: z.string(),
  images: z.array(z.string()).min(1),
  accent: z.enum(["mint", "gold"]),
  secondsPerImage: z.number().min(1).max(10),
});

type Props = z.infer<typeof productVideoSchema>;

const COLORS = {
  bg: "#0B0F14",
  ink: "#F5F7FA",
  mint: "#24E5A6",
  gold: "#F3C567",
  panel: "rgba(10,14,20,0.72)",
};

export const calculateProductVideoMetadata = ({
  props,
}: {
  props: Props;
}) => ({
  durationInFrames: Math.round(
    props.images.length * props.secondsPerImage * 30,
  ),
  fps: 30,
  width: 1080,
  height: 1920,
});

// Ken Burns: alternating slow zoom-in / zoom-out per slide, mirroring the
// zoom 2 / zoom 0 alternation the old JSON2Video slideshow used.
const Slide: React.FC<{
  src: string;
  durationInFrames: number;
  zoomIn: boolean;
}> = ({ src, durationInFrames, zoomIn }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = zoomIn
    ? interpolate(progress, [0, 1], [1.0, 1.18])
    : interpolate(progress, [0, 1], [1.18, 1.0]);

  const fade = interpolate(
    frame,
    [0, 12, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity: fade, backgroundColor: COLORS.bg }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(11,15,20,0.78) 0%, rgba(11,15,20,0.15) 38%, rgba(11,15,20,0.25) 62%, rgba(11,15,20,0.88) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const Hook: React.FC<{ text: string; accentColor: string }> = ({
  text,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div style={{ display: "flex", flexWrap: "wrap", rowGap: 4 }}>
      {words.map((word, i) => {
        const enter = spring({
          frame: frame - i * 2,
          fps,
          config: { damping: 14, mass: 0.6 },
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: 16,
              opacity: enter,
              transform: `translateY(${interpolate(enter, [0, 1], [34, 0])}px)`,
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.06,
              color: i === 0 || i === words.length - 1 ? accentColor : COLORS.ink,
              textShadow: "0 4px 24px rgba(0,0,0,0.65)",
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
    frame: frame - 30,
    fps,
    config: { damping: 18, mass: 0.7 },
  });

  return (
    <div
      style={{
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [28, 0])}px)`,
        backgroundColor: COLORS.panel,
        borderLeft: `5px solid ${accentColor}`,
        borderRadius: 10,
        padding: "20px 26px",
      }}
    >
      <span
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 34,
          fontWeight: 500,
          color: COLORS.ink,
          lineHeight: 1.32,
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const ProductVideo: React.FC<Props> = ({
  productTitle,
  hook,
  caption,
  images,
  accent,
  secondsPerImage,
}) => {
  const { durationInFrames } = useVideoConfig();
  const accentColor = accent === "gold" ? COLORS.gold : COLORS.mint;
  const slideFrames = Math.round(secondsPerImage * 30);

  const progress = interpolate(
    useCurrentFrame(),
    [0, durationInFrames - 1],
    [0, 1],
    { extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {images.map((src, i) => (
        <Sequence key={i} from={i * slideFrames} durationInFrames={slideFrames}>
          <Slide
            src={src}
            durationInFrames={slideFrames}
            zoomIn={i % 2 === 0}
          />
        </Sequence>
      ))}

      <AbsoluteFill
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: "rgba(255,255,255,0.10)",
        }}
      >
        <div
          style={{
            height: 6,
            width: `${progress * 100}%`,
            backgroundColor: accentColor,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          padding: "150px 56px 96px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Hook text={hook} accentColor={accentColor} />
        <CaptionBar text={caption} accentColor={accentColor} />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          bottom: 34,
          left: 56,
          right: 56,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        <span style={{ color: "rgba(245,247,250,0.62)" }}>
          {productTitle.length > 38
            ? `${productTitle.slice(0, 38)}...`
            : productTitle}
        </span>
        <span style={{ color: accentColor }}>Freedom Lifestyle Shop</span>
      </div>
    </AbsoluteFill>
  );
};
