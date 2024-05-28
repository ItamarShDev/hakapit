import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";
import { cache } from "react";
import { getTeam } from "~/server/fotmob-api";
export function Trophies() {
	return <TrophiesList />;
}

async function TrophiesList() {
	const teamData = await cache(getTeam)();
	return (
		<div className="flex gap-2 flex-wrap justify-center">
			{teamData.history?.trophyList
				?.filter((t) => t.won?.[0] !== "0")
				.map((trophy) => {
					const tournamentId = trophy.tournamentTemplateId?.[0];
					const leagueName = trophy.name?.[0];
					const won = trophy.won?.[0];
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
