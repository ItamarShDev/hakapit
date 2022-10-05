import useScript from "hooks/use-script";
import styles from "./style.module.css";
export function TwitterTimelineEmbed({
  podcastName,
}: {
  podcastName: "KapitPod" | "ShchunaPod";
}) {
  const { scriptTag } = useScript(["https://platform.twitter.com/widgets.js"]);
  return (
    <div className={styles.timeline}>
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
      {scriptTag}
    </div>
  );
}
