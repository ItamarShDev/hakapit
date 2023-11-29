import { useNavigation } from "@remix-run/react";
import { DancingIcon } from "~/components/dancing-icon";

export default function PendingUI({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  if (navigation.state === "loading") return <DancingIcon />;

  return children;
}
