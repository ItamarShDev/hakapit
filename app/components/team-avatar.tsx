import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TeamAvatar({
  teamName,
  teamShortName = teamName,
  teamId,
  iconPosition = "before",
}: {
  teamId: string | number;
  teamName: string;
  teamShortName?: string;
  iconPosition?: "before" | "after";
}) {
  return (
    <div
      className={`flex items-center gap-3 ${
        iconPosition == "after" ? "justify-end" : "justify-start"
      }`}
    >
      {iconPosition == "after" && teamName}
      <Avatar className="h-[25px] w-[25px]">
        <AvatarImage
          src={`https://images.fotmob.com/image_resources/logo/teamlogo/${teamId}_xsmall.png`}
        />
        <AvatarFallback className="scale-75">{teamShortName}</AvatarFallback>
      </Avatar>
      {iconPosition == "before" && teamName}
    </div>
  );
}
