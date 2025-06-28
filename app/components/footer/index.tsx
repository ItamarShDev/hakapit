import Link from "next/link";
import { InstallPrompt, PushNotificationManager } from "~/components/push-notification";

export default function Footer() {
	return (
		<div className="flex flex-wrap justify-center gap-2 py-4">
			<Link href="https://twitter.com/KapitPod">Twitter</Link>
			<span className="text-accent">|</span>
			<Link href="https://www.threads.net/@kapitpod">Threads</Link>
			<span className="text-accent">|</span>
			<Link href="https://www.facebook.com/KapitPod">Facebook</Link>
			<span className="text-accent">|</span>
			<Link href="https://www.instagram.com/kapitpod/">Instagram</Link>
			<span className="text-accent">|</span>
			<Link href="https://pod.link/1546442506">Pod.link</Link>
			<span className="text-accent">|</span>
			<InstallPrompt />
			<span className="text-accent">|</span>
			<PushNotificationManager />
		</div>
	);
}
