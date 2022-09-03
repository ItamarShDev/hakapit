import Head from "next/head";
import styles from "./style.module.css";
export function TwitterTimelineEmbed() {
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
        href="https://twitter.com/KapitPod?ref_src=twsrc%5Etfw"
      >
        הכפית בטוויטר
      </a>
      <Head>
        <script
          async
          src="https://platform.twitter.com/widgets.js"
          charSet="utf-8"
        ></script>
      </Head>
    </div>
  );
}
