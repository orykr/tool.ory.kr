<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Plus from "@lucide/svelte/icons/plus";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import Copy from "@lucide/svelte/icons/copy";
	import Check from "@lucide/svelte/icons/check";
	import { buildCurl, type Method, type BodyKind, type Header, type FormField } from "$lib/curl";

	const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

	let url = $state("https://api.example.com/v1/users");
	let method = $state<Method>("GET");
	let headers = $state<Header[]>([{ id: 1, name: "Accept", value: "application/json" }]);
	let nextHeaderId = 2;
	let bodyKind = $state<BodyKind>("none");
	let jsonBody = $state('{\n  "name": "Ada",\n  "email": "ada@example.com"\n}');
	let rawBody = $state("");
	let rawContentType = $state("text/plain");
	let formFields = $state<FormField[]>([{ id: 1, name: "key", value: "value" }]);
	let nextFieldId = 2;
	let user = $state("");
	let password = $state("");
	let bearer = $state("");
	let insecure = $state(false);
	let followRedirects = $state(true);
	let verbose = $state(false);
	let includeHead = $state(false);

	let command = $derived(
		buildCurl({
			url,
			method,
			headers,
			bodyKind,
			jsonBody,
			rawBody,
			rawContentType,
			formFields,
			user,
			password,
			bearer,
			insecure,
			followRedirects,
			verbose,
			includeHead
		})
	);

	function addHeader() {
		headers = [...headers, { id: nextHeaderId++, name: "", value: "" }];
	}
	function removeHeader(id: number) {
		headers = headers.filter((h) => h.id !== id);
	}

	function addField() {
		formFields = [...formFields, { id: nextFieldId++, name: "", value: "" }];
	}
	function removeField(id: number) {
		formFields = formFields.filter((f) => f.id !== id);
	}

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(command);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<main class="container mx-auto max-w-5xl px-6 py-12">
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
		<h1 class="text-3xl font-bold tracking-tight">cURL Command Builder</h1>
		<p class="text-muted-foreground mt-1">
			Build a portable cURL command from form inputs — no requests are sent.
		</p>
	</header>

	<Card.Root class="mb-4">
		<Card.Content class="space-y-4 pt-6">
			<div class="flex gap-2">
				<Select.Root type="single" bind:value={method as never}>
					<Select.Trigger class="w-32">{method}</Select.Trigger>
					<Select.Content>
						{#each METHODS as m (m)}
							<Select.Item value={m}>{m}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<Input bind:value={url} placeholder="https://example.com/path" class="flex-1 font-mono" />
			</div>

			<Tabs.Root value="headers">
				<Tabs.List class="grid w-full grid-cols-3">
					<Tabs.Trigger value="headers">Headers</Tabs.Trigger>
					<Tabs.Trigger value="body">Body</Tabs.Trigger>
					<Tabs.Trigger value="auth">Auth & Options</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="headers">
					<div class="space-y-2">
						{#each headers as h, i (h.id)}
							<div class="flex gap-2">
								<Input bind:value={headers[i].name} placeholder="Header" class="font-mono" />
								<Input bind:value={headers[i].value} placeholder="Value" class="font-mono" />
								<Button variant="ghost" size="icon" onclick={() => removeHeader(h.id)}>
									<Trash2 />
								</Button>
							</div>
						{/each}
						<Button variant="outline" size="sm" onclick={addHeader}>
							<Plus />
							Add header
						</Button>
					</div>
				</Tabs.Content>

				<Tabs.Content value="body">
					<div class="space-y-3">
						<div class="flex gap-2">
							{#each ["none", "json", "form", "raw"] as kind (kind)}
								<Button
									variant={bodyKind === kind ? "default" : "outline"}
									size="sm"
									onclick={() => (bodyKind = kind as BodyKind)}
								>
									{kind}
								</Button>
							{/each}
						</div>

						{#if bodyKind === "json"}
							<Textarea bind:value={jsonBody} class="min-h-40 font-mono text-sm" />
						{:else if bodyKind === "form"}
							<div class="space-y-2">
								{#each formFields as f, i (f.id)}
									<div class="flex gap-2">
										<Input
											bind:value={formFields[i].name}
											placeholder="key"
											class="font-mono"
										/>
										<Input
											bind:value={formFields[i].value}
											placeholder="value"
											class="font-mono"
										/>
										<Button variant="ghost" size="icon" onclick={() => removeField(f.id)}>
											<Trash2 />
										</Button>
									</div>
								{/each}
								<Button variant="outline" size="sm" onclick={addField}>
									<Plus />
									Add field
								</Button>
							</div>
						{:else if bodyKind === "raw"}
							<Input bind:value={rawContentType} placeholder="Content-Type" class="font-mono" />
							<Textarea bind:value={rawBody} class="min-h-40 font-mono text-sm" />
						{/if}
					</div>
				</Tabs.Content>

				<Tabs.Content value="auth">
					<div class="space-y-4">
						<div class="grid gap-3 sm:grid-cols-2">
							<div class="space-y-1.5">
								<Label for="usr">Basic auth user</Label>
								<Input id="usr" bind:value={user} class="font-mono" />
							</div>
							<div class="space-y-1.5">
								<Label for="pwd">Basic auth password</Label>
								<Input id="pwd" type="password" bind:value={password} class="font-mono" />
							</div>
						</div>
						<div class="space-y-1.5">
							<Label for="brr">Bearer token</Label>
							<Input id="brr" bind:value={bearer} class="font-mono" />
						</div>
						<div class="grid grid-cols-2 gap-2 text-sm">
							<label class="flex cursor-pointer items-center gap-2">
								<input
									type="checkbox"
									bind:checked={followRedirects}
									class="h-4 w-4 rounded border"
								/>
								Follow redirects (-L)
							</label>
							<label class="flex cursor-pointer items-center gap-2">
								<input type="checkbox" bind:checked={insecure} class="h-4 w-4 rounded border" />
								Insecure / skip TLS verify (-k)
							</label>
							<label class="flex cursor-pointer items-center gap-2">
								<input type="checkbox" bind:checked={verbose} class="h-4 w-4 rounded border" />
								Verbose (-v)
							</label>
							<label class="flex cursor-pointer items-center gap-2">
								<input
									type="checkbox"
									bind:checked={includeHead}
									class="h-4 w-4 rounded border"
								/>
								Include response headers (-i)
							</label>
						</div>
					</div>
				</Tabs.Content>
			</Tabs.Root>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<Card.Title class="text-base">Generated command</Card.Title>
			<Button variant="ghost" size="sm" onclick={copy}>
				{#if copied}<Check />Copied{:else}<Copy />Copy{/if}
			</Button>
		</Card.Header>
		<Card.Content>
			<pre class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">{command}</pre>
		</Card.Content>
	</Card.Root>
</main>
