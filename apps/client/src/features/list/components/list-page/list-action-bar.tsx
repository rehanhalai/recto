"use client";

import { Button } from "@/components/ui/button";
import { Heart, MoreHorizontal, Play, Share2 } from "lucide-react";

export function ListActionBar() {
	return (
		<div className="sticky top-0 z-20 backdrop-blur-md bg-background/80 px-6 sm:px-8 py-5 flex items-center justify-between border-b border-border-subtle/5">
			<div className="flex items-center gap-5">
				<Button className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 hover:scale-105 transition-all shadow-lg shadow-indigo-600/20 group">
					<Play className="fill-white text-white w-5 h-5 ml-0.5" />
				</Button>
				<Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-ink-muted hover:text-foreground transition">
					<Heart className="w-6 h-6" />
				</Button>
				<Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-ink-muted hover:text-foreground transition">
					<Share2 className="w-5 h-5" />
				</Button>
				<Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-ink-muted hover:text-foreground transition">
					<MoreHorizontal className="w-5 h-5" />
				</Button>
			</div>
			
			<div className="hidden md:flex items-center gap-3 text-xs text-ink-muted font-bold uppercase tracking-widest">
				<span>Filter</span>
				<div className="h-3 w-px bg-border-subtle/30" />
				<span>Sort</span>
			</div>
		</div>
	);
}
