import { EpisodeData } from "~/api/rss/types";

export default function Episode({ data }: { data: EpisodeData }) {
	return (
		<section className="relative flex flex-col justify-start h-full m-auto md:w-4/5 lg:flex-row lg:gap-8 lg:py-32">
			<img
				src={data.itunes.image}
				className="top-0 right-0 z-0 faded-image-vertical lg:no-mask max-h-96 max-w-max rounded-2xl"
				alt="episode"
			/>
			<div className="p-2 lg:p-8 flex gap-3 flex-col -translate-y-32 lg:translate-y-0">
				<div className="text-accent text-3xl">{data?.title}</div>
				<div className="flex flex-col max-w-xl gap-3 text-lg rounded-xl  lg:gap-14">
					<div
						/* biome-ignore lint: noDangerouslySetInnerHtml */
						dangerouslySetInnerHTML={{
							__html: data.content,
						}}
					/>
					<audio autoPlay className="audio" controls>
						<source src={data?.enclosure?.url} type="audio/ogg" />
						<track kind="captions" />
					</audio>
				</div>
			</div>
		</section>
	);
}
