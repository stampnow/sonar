import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import WebplayerShowcase from "@/components/sections/WebplayerShowcase";
import AiExperience from "@/components/sections/AiExperience";
import WhySonar from "@/components/sections/WhySonar";
import CallToAction from "@/components/sections/CallToAction";
import Preloader from "@/components/layout/Preloader";

export default function Home() {
  return (
    <>
      <Preloader />
      <Hero />
      <Features />
      <WebplayerShowcase />
      <AiExperience />
      <WhySonar />
      <CallToAction />
    </>
  );
}
