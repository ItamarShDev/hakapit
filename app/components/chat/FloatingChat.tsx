"use client";

import { useChat } from "@ai-sdk/react";
import { CornerDownLeft, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { getDirectionFromText } from "~/utils/text-direction";

export function FloatingChat() {
	const { messages, input, setInput, status, append } = useChat();
	const contentRef = useRef<HTMLDivElement>(null);
	const inputDir = getDirectionFromText(input);

	// The most recent user message id (used to show the loader next to it while waiting for an answer)
	const lastUserMessageId = [...messages].reverse().find((m) => m.role === "user")?.id;

	const handleSendMessage = () => {
		append({
			role: "user",
			content: input,
		});
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter") {
			setInput("");
			handleSendMessage();
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: We want to scroll to the bottom every time the answer or loading state changes.
	useEffect(() => {
		if (contentRef.current) {
			contentRef.current.scrollTop = contentRef.current.scrollHeight;
		}
	}, [messages]);
	return (
		<div className="fixed bottom-4 left-4 z-50">
			<Drawer direction="right">
				<DrawerTrigger asChild>
					<Button size="lg" className="text-accent hover:bg-accent hover:text-primary rounded">
						שאל אותי על ליברפול
					</Button>
				</DrawerTrigger>
				<DrawerContent>
					<DrawerHeader dir="rtl" className="flex flex-col border-b border-slate-600">
						<DrawerTitle className="flex items-center justify-between">
							Liver-Chat
							<DrawerClose asChild>
								<Button variant="ghost" size="icon" aria-label="סגור" className="hover:grow">
									<X className="h-5 w-5" />
								</Button>
							</DrawerClose>
						</DrawerTitle>

						<DrawerDescription dir="rtl" className="self-start">
							ניתן לשאול כל שאלה לגבי הקבוצה, בכל שפה
						</DrawerDescription>
					</DrawerHeader>
					<div ref={contentRef} className="flex-grow px-4 overflow-y-auto text-paragraph">
						{messages.map((message) => {
							if (message.role === "assistant") {
								const dir = getDirectionFromText(message.content);
								return (
									<div key={message.id} dir={dir} className="py-2 text-sm whitespace-pre-wrap">
										<ReactMarkdown
											remarkPlugins={[remarkGfm]}
											components={{
												a: (props) => (
													<a {...props} className="underline text-accent" target="_blank" rel="noreferrer" />
												),
												code: (props) => <code {...props} className="bg-black/30 rounded px-1" />,
												pre: (props) => <pre {...props} className="bg-black/30 rounded p-2 overflow-x-auto" />,
											}}
										>
											{message.content}
										</ReactMarkdown>
									</div>
								);
							}
							if (message.role === "user") {
								const dir = getDirectionFromText(message.content);
								return (
									<p
										className="flex items-center gap-2 text-accent py-4 sticky top-0 bg-popover"
										key={message.id}
										dir={dir}
									>
										{message.content}
										{message.id === lastUserMessageId && status === "submitted" && (
											<div className="h-8 w-8">
												<Image
													className="grayscale"
													src="/liverpool-animation.gif"
													alt="liverbird"
													width={30}
													height={30}
													priority={true}
												/>
											</div>
										)}
									</p>
								);
							}
							return null;
						})}
					</div>
					<div className="p-2 flex flex-row border-t">
						<Textarea
							value={input}
							onChange={(e) => {
								setInput(e.target.value);
							}}
							onKeyDown={handleKeyDown}
							placeholder="הקלד שאלה..."
							className={`pr-10 border-0 text-accent bg-transparent text-right ${inputDir === "rtl" ? "text-left" : "text-right"}`}
							disabled={status === "streaming" || status === "submitted"}
						/>
						<Button
							size="icon"
							onClick={handleSendMessage}
							disabled={status === "streaming" || status === "submitted"}
							className="bg-transparent"
						>
							<CornerDownLeft className="h-4 w-4" color="yellow" />
						</Button>
					</div>
				</DrawerContent>
			</Drawer>
		</div>
	);
}
