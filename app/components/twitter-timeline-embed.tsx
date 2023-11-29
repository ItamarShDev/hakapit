function getHandle(podcastName: "hakapit" | "balcony-albums" | "nitk") {
  switch (podcastName) {
    case "hakapit":
      return "KapitPod";
    case "balcony-albums":
      return "balconyalbums";
    case "nitk":
      return "ShchunaPod";
  }
}

export function TwitterTimelineEmbed({
  podcastName,
}: {
  podcastName: "hakapit" | "balcony-albums" | "nitk";
}) {
  const handle = getHandle(podcastName);

  return (
    <div className="timeline" key={podcastName}>
      <a
        className="twitter-timeline"
        data-lang="he"
        data-theme="dark"
        data-tweet-limit="3"
        data-height="640"
        data-chrome="noborders transparent"
        href={`https://twitter.com/${handle}?ref_src=twsrc%5Etfw`}
      >
        {" "}
      </a>
    </div>
  );
}
