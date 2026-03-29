"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MoreHorizontal } from "lucide-react";
import { StarRating } from "@/components/StarRating";

interface ListTableProps {
	items: any[];
	formatDate: (date: string) => string;
}

export function ListTable({ items, formatDate }: ListTableProps) {
	if (!items || items.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center pt-16 pb-8 text-center opacity-60">
				<div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
					<MoreHorizontal className="text-ink-muted/30 w-6 h-6" />
				</div>
				<h3 className="text-lg font-bold text-foreground mb-1 font-serif italic">Empty Shelf</h3>
				<p className="text-sm text-ink-muted max-w-50 mx-auto leading-relaxed">
					No books have found their way into this list yet.
				</p>
			</div>
		);
	}

	return (
		<div className="px-2 sm:px-6 mt-4">
			<div className="grid grid-cols-[auto_1fr_1fr_0.5fr_auto] gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-muted/60 border-b border-border-subtle/10 mb-2 sticky top-20.5 bg-background z-10 transition-colors duration-300">
				<div className="w-6 text-center">#</div>
				<div>Title</div>
				<div className="hidden sm:block">Author</div>
				<div className="hidden md:block">Rating</div>
				<div className="pr-2 text-right">
					<Clock className="w-3.5 h-3.5 ml-auto opacity-50" />
				</div>
			</div>

			<div className="space-y-0.5">
				{items.map((item: any, index: number) => (
					<Link
						key={item.book.id}
						href={`/book/${item.book.id}`}
						className="grid grid-cols-[auto_1fr_1fr_0.5fr_auto] gap-4 items-center p-2 rounded-md hover:bg-white/5 transition group cursor-pointer"
					>
						<div className="w-6 text-center text-ink-muted/50 font-mono text-xs group-hover:text-foreground">
							{index + 1}
						</div>
						
						<div className="flex items-center gap-3 min-w-0">
							<div className="relative w-10 h-14 rounded overflow-hidden shadow-sm bg-muted/20 border border-white/5 shrink-0">
								{item.book.coverImage ? (
									<Image
										src={item.book.coverImage}
										alt={item.book.title}
										fill
										className="object-cover group-hover:scale-105 transition duration-500"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-ink/20 bg-muted/5">
										N/A
									</div>
								)}
							</div>
							<div className="flex flex-col min-w-0">
								<span className="font-semibold text-sm text-foreground truncate group-hover:underline">
									{item.book.title}
								</span>
								<span className="sm:hidden text-ink-muted/70 text-[10px] truncate">
									{item.book.authors?.map((a: any) => a.authorName).join(", ") || "Unknown Author"}
								</span>
							</div>
						</div>

						<div className="hidden sm:block text-ink-muted/80 text-xs truncate pr-4">
							{item.book.authors?.map((a: any) => a.authorName).join(", ") || "Unknown Author"}
						</div>

						<div className="hidden md:flex items-center gap-1.5 min-w-20">
							{item.book.averageRating ? (
								<div className="flex items-center gap-1">
									<StarRating rating={Math.round(parseFloat(item.book.averageRating))} className="scale-75 origin-left" />
									<span className="text-[10px] font-bold text-gold/60">
										{parseFloat(item.book.averageRating).toFixed(1)}
									</span>
								</div>
							) : (
								<span className="text-ink-muted/20 text-[10px] font-bold tracking-tighter">UNRATED</span>
							)}
						</div>

						<div className="pr-2 text-right text-[11px] text-ink-muted font-medium whitespace-nowrap">
							{formatDate(item.addedAt)}
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
