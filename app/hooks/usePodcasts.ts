"use client";
import { useMutation, useQuery } from "convex/react";
import type { PodcastName } from "~/providers/convex/feed";
import { api } from "../../convex/_generated/api";

// Hook to get podcast with episodes (real-time streaming)
export function usePodcastWithEpisodes(name: PodcastName, limit?: number) {
	return useQuery(api.podcasts.getPodcastWithEpisodes, { name, limit });
}

// Hook to get latest episode (real-time streaming)
export function useLatestEpisode(podcastName: PodcastName) {
	return useQuery(api.podcasts.getLatestEpisode, { podcastName });
}

// Hook to get episode by number (real-time streaming)
export function useEpisode(podcastName: PodcastName, episodeNumber: number) {
	return useQuery(api.podcasts.getEpisodeByNumber, { podcastName, episodeNumber });
}

// Hook to get all podcasts (real-time streaming)
export function useAllPodcasts() {
	return useQuery(api.podcasts.getAllPodcasts);
}

// Hook to update podcast
export function useUpsertPodcast() {
	return useMutation(api.podcasts.upsertPodcast);
}

// Hook to create episode
export function useCreateEpisode() {
	return useMutation(api.podcasts.createEpisode);
}

// Hook to check if podcast needs update
export function usePodcastUpdateStatus(name: PodcastName) {
	return useQuery(api.podcasts.getPodcastUpdateStatus, { name });
}

// Hook for migration status
export function useMigrationStatus() {
	return useQuery(api.migrate.getMigrationStatus);
}

// Hook for migrating podcasts
export function useMigratePodcasts() {
	return useMutation(api.migrate.migratePodcasts);
}

// Hook for migrating episodes
export function useMigrateEpisodes() {
	return useMutation(api.migrate.migrateEpisodes);
}

// Hook for initializing fetch time
export function useInitializeFetchTime() {
	return useMutation(api.migrate.initializeFetchTime);
}
