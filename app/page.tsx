import { CursorGlow } from "@/components/landing/CursorGlow";
import { GamePresenceSection } from "@/components/landing/GamePresenceSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { PlansSection } from "@/components/landing/PlansSection";
import { ReleaseSection } from "@/components/landing/ReleaseSection";
import { VisualShowcaseSection } from "@/components/landing/VisualShowcaseSection";

export default function Home() {
  return (
    <>
      <CursorGlow />
      <HeroSection />
      <GamePresenceSection />
      <VisualShowcaseSection />
      <ReleaseSection />
      <PlansSection />
    </>
  );
}
