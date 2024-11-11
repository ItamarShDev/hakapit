import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";

export function Trophies() {
	const trophies = [
		{ tournamentId: 42, name: "Champions League", won: 6 },
		{ tournamentId: 47, name: "Premier League", won: 19 },
		{ tournamentId: 132, name: "FA Cup", won: 8 },
		{ tournamentId: 133, name: "EFL Cup", won: 10 },
		{ tournamentId: 73, name: "Europa League", won: 3 },
		{ tournamentId: 74, name: "UEFA Super Cup", won: 4 },
		{ tournamentId: 247, name: "Community Shield", won: 16 },
		{ tournamentId: 48, name: "Championship", won: 4 },
	];
	return (
		<div className="flex gap-2 flex-wrap justify-center">
			{trophies.map((trophy) => {
				const tournamentId = trophy.tournamentId;
				const leagueName = trophy.name;
				const won = trophy.won;
				if (!leagueName || !won) return null;
				return (
					<div className="flex flex-col gap-1" key={tournamentId}>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<Avatar className="h-[50px] w-[50px]">
										<Image
											priority={true}
											height={50}
											width={50}
											alt={leagueName}
											src={`https://images.fotmob.com/image_resources/logo/leaguelogo/dark/${tournamentId}.png`}
										/>
										<AvatarFallback className="scale-75">{leagueName}</AvatarFallback>
									</Avatar>
								</TooltipTrigger>
								<TooltipContent side="bottom" className="rounded-xl bg-primary border-primary text-accent">
									<div>{leagueName}</div>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<div className="text-sm text-gray-100">{won}</div>
					</div>
				);
			})}
		</div>
	);
}
