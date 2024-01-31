import { Episode as DBEpisode } from "~/db/types";

export default function Episode({ data }: { data: DBEpisode }) {
	return (
		<section className="relative flex flex-col items-center justify-start w-full h-full m-auto lg:items-start lg:flex-row lg:gap-8 lg:py-32">
			{data.imageUrl && (
				<img
					src={data.imageUrl}
					className="top-0 right-0 z-0 faded-image-vertical lg:no-mask max-h-96 max-w-max rounded-2xl"
					alt="episode"
				/>
			)}
			<div className="flex flex-col gap-3 p-2 -translate-y-32 lg:p-8 lg:translate-y-0">
				<div className="text-3xl text-accent">{data?.title}</div>
				<div className="flex flex-col max-w-xl gap-3 text-lg rounded-xl lg:gap-14">
					<div
						/* biome-ignore lint: noDangerouslySetInnerHtml */
						dangerouslySetInnerHTML={{
							__html: data.description || "",
						}}
					/>
					<audio autoPlay className="audio" controls>
						<source src={data.audioUrl} type="audio/ogg" />
						<track kind="captions" />
					</audio>
				</div>
			</div>
		</section>
	);
}
