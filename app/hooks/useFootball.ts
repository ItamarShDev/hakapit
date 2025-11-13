"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Hook to get all transfers (real-time streaming)
export function useAllTransfers() {
	return useQuery(api.football.getAllTransfers);
}

// Hook to get transfer by player ID (real-time streaming)
export function useTransferByPlayerId(playerId: number) {
	return useQuery(api.football.getTransferByPlayerId, { playerId });
}

// Hook to get transfers by team ID (real-time streaming)
export function useTransfersByTeamId(teamId: number) {
	return useQuery(api.football.getTransfersByTeamId, { teamId });
}

// Hook to upsert transfer
export function useUpsertTransfer() {
	return useMutation(api.football.upsertTransfer);
}

// Hook to get fetch time
export function useFetchTime() {
	return useQuery(api.football.getFetchTime);
}

// Hook to update fetch time
export function useUpdateFetchTime() {
	return useMutation(api.football.updateFetchTime);
}

// Hook to delete transfer
export function useDeleteTransfer() {
	return useMutation(api.football.deleteTransfer);
}
