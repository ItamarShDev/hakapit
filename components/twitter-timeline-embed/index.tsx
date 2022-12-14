import Script from "next/script";
import styles from "./style.module.css";
export function TwitterTimelineEmbed({
  podcastName,
}: {
  podcastName: "KapitPod" | "ShchunaPod" | "balconyalbums";
}) {
  return (
    <div className={styles.timeline}>
      <Script src="https://platform.twitter.com/widgets.js" />
      <a
        className="twitter-timeline"
        data-lang="he"
        data-dnt="true"
        data-theme="dark"
        data-tweet-limit="10"
        data-height="720"
        data-chrome="noborders"
        href={`https://twitter.com/${podcastName}?ref_src=twsrc%5Etfw`}
      ></a>
    </div>
  );
}
