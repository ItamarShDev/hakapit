import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getTeam } from "~/server/fotmob-api";

export async function TrophiesList() {
	const teamData = await getTeam();
	return (
		<div className="flex gap-2 flex-wrap justify-center">
			{teamData.history?.trophyList
				?.filter((t) => t.won?.[0] !== "0")
				.map((trophy) => {
					const tournamentId = trophy.tournamentTemplateId?.[0];
					const leagueName = trophy.name?.[0];
					const won = trophy.won?.[0];
					return (
						<div className="flex flex-col gap-1" key={tournamentId}>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger>
										<Avatar className="h-[50px] w-[50px]">
											<AvatarImage>
												<Image
													src={`https://images.fotmob.com/image_resources/logo/leaguelogo/dark/${tournamentId}.png`}
												/>
											</AvatarImage>
											<AvatarFallback className="scale-75">{leagueName}</AvatarFallback>
										</Avatar>
									</TooltipTrigger>
									<TooltipContent side="bottom" className="rounded-xl bg-primary border-primary">
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
