"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useChat } from "@ai-sdk/react";
import { CornerDownLeft } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function FloatingChat() {
	const [isOpen, setIsOpen] = useState(false);
	const { messages, input, setInput, status, append } = useChat();
	const contentRef = useRef<HTMLDivElement>(null);

	const handleSendMessage = () => {
		append({
			role: "user",
			content: input,
		});
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
		<div className="fixed bottom-4 right-4 z-50">
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button size="lg" className="text-accent hover:bg-accent hover:text-primary rounded">
						שאל אותי על ליברפול
					</Button>
				</PopoverTrigger>
				<PopoverContent
					sideOffset={10}
					className="w-80 h-[500px] p-0 flex flex-col direction rounded-xl    
					data-[state=open]:animate-in 
          data-[state=open]:fade-in-0 
          data-[state=open]:zoom-in-95 
          data-[state=open]:slide-in-from-top-2 
          
          data-[state=closed]:animate-out 
          data-[state=closed]:fade-out-0 
          data-[state=closed]:zoom-out-95 
          data-[state=closed]:slide-out-to-top-2"
				>
					<div ref={contentRef} className="flex-grow px-4 overflow-y-auto text-paragraph">
						{messages.map((message, index) => {
							if (message.role === "assistant") {
								return (
									<p
										className={`py-2 text-sm ${status === "streaming" && index === messages.length - 1 ? "text-gray-200" : "text-paragraph"}`}
										key={message.id}
									>
										{message.content}
									</p>
								);
							}
							if (message.role === "user") {
								return (
									<p className="text-accent py-4 sticky top-0 bg-popover" key={message.id}>
										{message.content}
										{status === "submitted" && (
											<div className="h-8 w-8">
												<Image src="/liverpool-animation.gif" alt="liverbird" width={30} height={30} priority={true} />
											</div>
										)}
									</p>
								);
							}
							return null;
						})}
					</div>
					<div className="p-2 flex flex-row border-t">
						<Input
							value={input}
							onChange={(e) => {
								setInput(e.target.value);
							}}
							onKeyDown={handleKeyDown}
							placeholder="הקלד שאלה..."
							className="pr-10 border-0 text-accent bg-transparent"
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
				</PopoverContent>
			</Popover>
		</div>
	);
}
