import "./index.css";
import { Composition } from "remotion";
import { HookOverlay, hookOverlaySchema } from "./HookOverlay";
import {
  ShortVideo,
  shortVideoSchema,
  calculateShortVideoMetadata,
} from "./ShortVideo";
import {
  ProductVideo,
  productVideoSchema,
  calculateProductVideoMetadata,
} from "./ProductVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HookOverlay"
        component={HookOverlay}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={hookOverlaySchema}
        defaultProps={{
          kicker: "Money Tip",
          hook: "You're losing $200/mo to this one mistake",
          caption: "Swipe to see the fix →",
          accent: "mint",
        }}
      />
      <Composition
        id="ShortVideo"
        component={ShortVideo}
        fps={30}
        width={1080}
        height={1920}
        schema={shortVideoSchema}
        calculateMetadata={calculateShortVideoMetadata}
        defaultProps={{
          scenes: [
            {
              src: "https://videos.pexels.com/video-files/8472307/8472307-hd_720_1280_50fps.mp4",
              durationInSeconds: 10,
            },
          ],
          voiceoverFile: undefined,
          hookText: "Money Tip\nGoes Here",
          hookDurationSeconds: 4,
          captions: [],
          disclaimerStartSeconds: 6,
          disclaimerDurationSeconds: 4,
          accent: "gold",
        }}
      />
      <Composition
        id="ProductVideo"
        component={ProductVideo}
        fps={30}
        width={1080}
        height={1920}
        schema={productVideoSchema}
        calculateMetadata={calculateProductVideoMetadata}
        defaultProps={{
          productTitle: "Sample Product",
          hook: "This gadget sold out 3 times",
          caption: "Under $30 and it actually works.\nLink in bio.",
          images: [
            "https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg",
            "https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg",
          ],
          accent: "mint" as const,
          secondsPerImage: 3,
        }}
      />
    </>
  );
};
