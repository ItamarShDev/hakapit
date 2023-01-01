export function TwitterTimelineEmbed({
  podcastName,
}: {
  podcastName: "KapitPod" | "ShchunaPod" | "balconyalbums";
}) {
  return (
    <div className="timeline">
      <a
        data-lang="he"
        data-dnt="true"
        data-theme="dark"
        data-tweet-limit="10"
        data-height="720"
        data-chrome="noborders"
        href={`https://twitter.com/${podcastName}?ref_src=twsrc%5Etfw`}
      >
        feed
      </a>
    </div>
  );
}
