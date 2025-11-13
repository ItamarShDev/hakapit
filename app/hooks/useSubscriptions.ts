"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Hook to get subscription by user ID (real-time streaming)
export function useSubscriptionByUserId(userId: string) {
	return useQuery(api.subscriptions.getSubscriptionByUserId, { userId });
}

// Hook to get subscriptions by podcast (real-time streaming)
export function useSubscriptionsByPodcast(podcast: string) {
	return useQuery(api.subscriptions.getSubscriptionsByPodcast, { podcast });
}

// Hook to get all subscriptions (real-time streaming)
export function useAllSubscriptions() {
	return useQuery(api.subscriptions.getAllSubscriptions);
}

// Hook to upsert subscription
export function useUpsertSubscription() {
	return useMutation(api.subscriptions.upsertSubscription);
}

// Hook to delete subscription
export function useDeleteSubscription() {
	return useMutation(api.subscriptions.deleteSubscription);
}

// Hook to cleanup expired subscriptions
export function useCleanupExpiredSubscriptions() {
	return useMutation(api.subscriptions.cleanupExpiredSubscriptions);
}
