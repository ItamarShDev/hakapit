<script lang="ts">
	import TeamAvatar from './TeamAvatar.svelte';
	import { LiverpoolId } from '$lib/types/soccer';
	import { cn } from '$lib/utils';
	import type { League, TableEntry } from '$lib/types/soccer';

	let { leaguesData }: { leaguesData: Array<{ leagueId: string; league: League }> } = $props();

	function getTeams(league: League): TableEntry[] | null {
		const standings = league.standings[0].table;
		const teamStatsIndex = standings?.findIndex((stat) => stat.team.id === LiverpoolId);
		if (teamStatsIndex === -1 || teamStatsIndex === undefined) return null;

		if (teamStatsIndex === 0) {
			return [standings[0], standings[1], standings[2]];
		}
		if (teamStatsIndex === standings.length - 1) {
			return [
				standings[teamStatsIndex - 2],
				standings[teamStatsIndex - 1],
				standings[teamStatsIndex]
			];
		}
		return [
			standings[teamStatsIndex - 1],
			standings[teamStatsIndex],
			standings[teamStatsIndex + 1]
		];
	}
</script>

<div class="grid-col-responsive grid items-start justify-items-center w-full gap-3">
	{#each leaguesData as { league } (league.competition?.id)}
		{@const leagueId = league.competition?.id}
		{@const leagueName = league.competition?.name}
		{@const emblem = league.competition?.emblem}
		{@const isPlayoff = league.standings?.[0].type === 'PLAYOFF'}
		{@const teams = getTeams(league)}
		{@const teamStats = league.standings[0].table.find((t) => t.team.id === LiverpoolId)}

		{#if leagueId && leagueName}
			<div class="animate-fade flex flex-col w-full max-w-[700px]">
				<div class="bg-accent text-slate-900 flex items-center justify-center px-6 py-2 gap-4">
					<div class="text-xl font-bold">{leagueName}</div>
					<img
						class="h-[30px] w-[30px]"
						src={emblem}
						alt="{leagueName} logo"
						loading="lazy"
						decoding="async"
					/>
				</div>
				<div class="py-4 px-2">
					{#if isPlayoff}
						<table class="w-full text-sm">
							<tbody>
								<tr class="border-0">
									<td class="p-3 text-start w-[100px] text-slate-300 whitespace-nowrap"
										>מחזור / סבב</td
									>
									<td class="text-start p-3 font-bold capitalize"
										>{league.standings[0].stage}</td
									>
								</tr>
								<tr class="border-0">
									<td class="p-3 text-start w-[100px] text-slate-300 whitespace-nowrap"
										>מיקום</td
									>
									<td class="text-start p-3 font-bold">{teamStats?.position}</td>
								</tr>
								{#if teamStats?.points !== undefined}
									<tr class="border-0">
										<td class="p-3 text-start w-[100px] text-slate-300 whitespace-nowrap"
											>נקודות</td
										>
										<td class="text-start p-3 font-bold">{teamStats?.points}</td>
									</tr>
								{/if}
								{#if teamStats?.goalDifference !== undefined}
									<tr class="border-0">
										<td class="p-3 text-start w-[100px] text-slate-300 whitespace-nowrap"
											>יחס שערים</td
										>
										<td class="text-start p-3 font-bold">{teamStats?.goalDifference}</td>
									</tr>
								{/if}
							</tbody>
						</table>
					{:else if teams}
						<table class="text-xs w-full">
							<thead>
								<tr class="border-0">
									<th class="text-start p-2">קבוצה</th>
									<th class="text-start p-2">מיקום</th>
									<th class="text-start p-2">נקודות</th>
									<th class="text-start p-2">משחקים</th>
									<th class="text-start p-2 hidden md:table-cell">יחס נצחונות</th>
									<th class="text-start p-2">יחס שערים</th>
								</tr>
							</thead>
							<tbody>
								{#each teams as standing (standing.team.id)}
									<tr
										class={cn(
											'border-0',
											standing.team.id === LiverpoolId &&
												'bg-primary-opaque text-accent',
											standing.team.id === LiverpoolId &&
												standing.position === 1 &&
												'text-green-400'
										)}
									>
										<td class="text-start p-3 font-bold">
											<TeamAvatar hoverable team={standing.team} />
										</td>
										<td class="text-start p-3 font-bold">{standing.position}</td>
										<td class="text-start p-3 font-bold">{standing.points}</td>
										<td class="text-start p-3 font-bold">{standing.playedGames}</td>
										<td class="text-start hidden md:table-cell p-3">
											{standing.won}-{standing.lost}
										</td>
										<td class="text-start p-3 font-bold">
											{standing.goalsFor}-{standing.goalsAgainst}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</div>
			</div>
		{/if}
	{/each}
</div>
