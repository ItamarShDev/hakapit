"use client";

import { useEffect, useState } from "react";

export function GameTimer({ start }: { start: Date }) {
	const [time, setTime] = useState(Date.now() - new Date(start).getTime());
	useEffect(() => {
		const interval = setInterval(() => {
			setTime(Date.now() - new Date(start).getTime());
		}, 1000);
		return () => clearInterval(interval);
	}, [start]);
	const timeMinutes = time / 1000;
	const minutes = Math.floor(timeMinutes / 60);
	return <div>'{minutes}</div>;
}
