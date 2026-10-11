type HomeSnapshotLoaders<TSnapshot, TTransfers, TEpisode> = {
  snapshot: () => Promise<TSnapshot | null>;
  transfers: () => Promise<TTransfers | null>;
  latestEpisode: () => Promise<TEpisode | null>;
};

export async function loadHomeSnapshot<TSnapshot, TTransfers, TEpisode>({
  snapshot,
  transfers,
  latestEpisode,
}: HomeSnapshotLoaders<TSnapshot, TTransfers, TEpisode>) {
  const [snapshotData, transfersData, latestEpisodeData] = await Promise.all([
    snapshot().catch((err) => {
      console.warn("Failed to fetch soccer snapshot", err);
      return null;
    }),
    transfers().catch((err) => {
      console.warn("Failed to fetch transfers snapshot", err);
      return null;
    }),
    latestEpisode().catch((err) => {
      console.warn("Failed to fetch latest episode snapshot", err);
      return null;
    }),
  ]);

  return {
    snapshot: snapshotData,
    transfers: transfersData,
    latestEpisode: latestEpisodeData,
  };
}
