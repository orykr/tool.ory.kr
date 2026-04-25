<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import Download from "@lucide/svelte/icons/download";

	function localDateTime(d: Date): string {
		const pad = (n: number) => n.toString().padStart(2, "0");
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	let summary = $state("Project Sync");
	let location = $state("Zoom");
	let description = $state("Weekly project sync.\nAgenda: status, blockers, decisions.");
	let start = $state(localDateTime(new Date(Date.now() + 86_400_000)));
	let end = $state(localDateTime(new Date(Date.now() + 86_400_000 + 3_600_000)));
	let allDay = $state(false);
	let url = $state("");
	let organizer = $state("alice@example.com");
	let attendees = $state("bob@example.com, carol@example.com");

	function escapeIcs(value: string): string {
		return value
			.replace(/\\/g, "\\\\")
			.replace(/\n/g, "\\n")
			.replace(/,/g, "\\,")
			.replace(/;/g, "\\;");
	}

	function utcStamp(date: Date): string {
		const pad = (n: number) => n.toString().padStart(2, "0");
		return (
			`${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T` +
			`${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
		);
	}

	function dateOnlyStamp(date: Date): string {
		const pad = (n: number) => n.toString().padStart(2, "0");
		return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
	}

	function uid(): string {
		const buf = new Uint8Array(8);
		crypto.getRandomValues(buf);
		return Array.from(buf)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("") + "@tool.ory.kr";
	}

	let stableUid = $state(uid());

	let ics = $derived.by(() => {
		const startDate = new Date(start);
		const endDate = new Date(end);
		if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return "";

		const lines: string[] = [
			"BEGIN:VCALENDAR",
			"VERSION:2.0",
			"PRODID:-//ory.kr//Tools//EN",
			"CALSCALE:GREGORIAN",
			"BEGIN:VEVENT",
			`UID:${stableUid}`,
			`DTSTAMP:${utcStamp(new Date())}`
		];
		if (allDay) {
			lines.push(`DTSTART;VALUE=DATE:${dateOnlyStamp(startDate)}`);
			const exclusiveEnd = new Date(endDate);
			exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);
			lines.push(`DTEND;VALUE=DATE:${dateOnlyStamp(exclusiveEnd)}`);
		} else {
			lines.push(`DTSTART:${utcStamp(startDate)}`);
			lines.push(`DTEND:${utcStamp(endDate)}`);
		}
		lines.push(`SUMMARY:${escapeIcs(summary)}`);
		if (location) lines.push(`LOCATION:${escapeIcs(location)}`);
		if (description) lines.push(`DESCRIPTION:${escapeIcs(description)}`);
		if (url) lines.push(`URL:${escapeIcs(url)}`);
		if (organizer) lines.push(`ORGANIZER:mailto:${organizer.trim()}`);
		const attList = attendees.split(/[,;\s]+/).map((a) => a.trim()).filter(Boolean);
		for (const a of attList) lines.push(`ATTENDEE:mailto:${a}`);
		lines.push("END:VEVENT");
		lines.push("END:VCALENDAR");
		return lines.join("\r\n");
	});

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(ics);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	function download() {
		const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
		const u = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = u;
		a.download = "event.ics";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(u);
	}

	function regenerateUid() {
		stableUid = uid();
	}
</script>

<main class="container mx-auto max-w-4xl px-6 py-12">
	<nav class="mb-6">
		<a
			href="/"
			class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to Tools
		</a>
	</nav>

	<header class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">iCalendar (.ics) Event</h1>
		<p class="text-muted-foreground mt-1">
			Build an iCalendar VEVENT for use with Google Calendar, Apple Calendar, Outlook, etc.
		</p>
	</header>

	<div class="grid gap-4 md:grid-cols-2">
		<Card.Root>
			<Card.Header><Card.Title class="text-base">Event details</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				<div class="space-y-1.5">
					<Label for="sm">Summary</Label>
					<Input id="sm" bind:value={summary} />
				</div>
				<div class="space-y-1.5">
					<Label for="lc">Location</Label>
					<Input id="lc" bind:value={location} />
				</div>
				<div class="space-y-1.5">
					<Label for="dc">Description</Label>
					<Textarea id="dc" bind:value={description} class="min-h-20" />
				</div>
				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={allDay} class="h-4 w-4 rounded border" />
					All-day event
				</label>
				<div class="grid gap-3 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label for="st">Start</Label>
						<Input id="st" type={allDay ? "date" : "datetime-local"} bind:value={start} class="font-mono" />
					</div>
					<div class="space-y-1.5">
						<Label for="en">End</Label>
						<Input id="en" type={allDay ? "date" : "datetime-local"} bind:value={end} class="font-mono" />
					</div>
				</div>
				<div class="space-y-1.5">
					<Label for="ur">URL</Label>
					<Input id="ur" bind:value={url} />
				</div>
				<div class="space-y-1.5">
					<Label for="og">Organizer email</Label>
					<Input id="og" bind:value={organizer} />
				</div>
				<div class="space-y-1.5">
					<Label for="at">Attendees (comma-separated emails)</Label>
					<Input id="at" bind:value={attendees} />
				</div>
				<Button variant="outline" size="sm" onclick={regenerateUid}>Regenerate UID</Button>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">.ics output</Card.Title>
				<div class="flex gap-2">
					<Button variant="ghost" size="sm" onclick={copy}>
						{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
					</Button>
					<Button variant="outline" size="sm" onclick={download}>
						<Download />
						Download
					</Button>
				</div>
			</Card.Header>
			<Card.Content>
				<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{ics}</pre>
			</Card.Content>
		</Card.Root>
	</div>
</main>
