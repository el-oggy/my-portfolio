import ItomExperience from "@/components/ItomExperience";

export default function ExperienceRoot({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <ItomExperience fallback={children} />;
}
