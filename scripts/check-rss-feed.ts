import Parser from "rss-parser";

const HAKAPIT_RSS = process.env.HAKAPIT_RSS;

if (!HAKAPIT_RSS) {
	console.error("HAKAPIT_RSS not set");
	process.exit(1);
}

async function checkRSSFeed() {
	console.log("🔍 Fetching RSS feed...\n");

	try {
		const parser = new Parser();
		const feed = await parser.parseURL(HAKAPIT_RSS!);
		
		const episodes = feed.items
			.filter((item) => !item.title?.includes("מתוך פרק"))
			.filter((item) => item.title?.includes("פרק"))
			.map((item) => {
				const episodeMatch = item.title?.match(/פרק (\d+)/) || item.title?.match(/פרק - (\d+)/);
				const episodeNumber = episodeMatch ? Number(episodeMatch[1]) : 0;
				
				return {
					number: episodeNumber,
					title: item.title,
					pubDate: item.pubDate,
				};
			})
			.filter(ep => ep.number > 0)
			.sort((a, b) => b.number - a.number);
		
		console.log(`📻 Found ${episodes.length} episodes in RSS feed\n`);
		console.log("🔝 Top 10 episodes:");
		episodes.slice(0, 10).forEach((ep, i) => {
			console.log(`   ${i + 1}. Episode #${ep.number} - ${ep.title}`);
			console.log(`      Published: ${ep.pubDate}`);
		});
		
		if (episodes.length > 0) {
			const highest = episodes[0];
			console.log(`\n✨ Highest episode number in feed: #${highest.number}`);
			console.log(`   Title: ${highest.title}`);
		}
		
	} catch (error) {
		console.error("\n❌ Error:", error);
		process.exit(1);
	}
}

checkRSSFeed();
