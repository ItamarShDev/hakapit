import { useState } from "react";
import { Avatar, AvatarImage } from "~/@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/@/components/ui/tooltip";

export function Trophies() {
	const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

	const handleImageLoad = (tournamentId: number) => {
		setLoadedImages((prev) => new Set(prev).add(tournamentId));
	};
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
		<div data-testid="trophies-section" className="avatar-grid">
			{trophies.map((trophy) => {
				const tournamentId = trophy.tournamentId;
				const leagueName = trophy.name;
				const won = trophy.won;
				if (!leagueName || !won) return null;
				return (
					<div key={tournamentId}>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<Avatar className="aspect-square w-full h-auto" data-testid={`trophy-${tournamentId}`}>
										<AvatarImage
											alt={leagueName}
											src={`https://images.fotmob.com/image_resources/logo/leaguelogo/dark/${tournamentId}.png`}
											loading="lazy"
											decoding="async"
											className="object-contain"
											sizes="64px"
											onLoad={() => handleImageLoad(tournamentId)}
										/>
									</Avatar>
								</TooltipTrigger>
								<TooltipContent side="bottom" className="rounded-xl bg-primary border-primary text-accent">
									<div>{leagueName}</div>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						{loadedImages.has(tournamentId) && <div className="text-sm text-gray-100">{won}</div>}
					</div>
				);
			})}
		</div>
	);
}
