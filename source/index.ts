import {
	DEFAULT_EMBED_COLOUR,
	SERVICE_VALUES,
	Service,
	ServiceToString,
	type Services,
} from "./utility/constants.js";

interface Env {
	FLIGHT_CHECK: KVNamespace;
	AUTHENTICATION_CAELUS: string;
	WEBHOOK_URL: string;
}

export default {
	async scheduled(_, env) {
		const services = await env.FLIGHT_CHECK.list();

		const missingServices = SERVICE_VALUES.filter((service) => {
			const serviceString = String(service);
			return !services.keys.some(({ name }) => name === serviceString);
		});

		if (missingServices.length === 0) {
			return;
		}

		await fetch(env.WEBHOOK_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				embeds: [
					{
						color: DEFAULT_EMBED_COLOUR,
						description: missingServices
							.map((service) => `- ${ServiceToString[service]}`)
							.join("\n"),
						title: "Health Check Failed",
					},
				],
			}),
		});
	},
	async fetch(request, env) {
		if (request.method !== "GET") {
			return new Response("Method not allowed.", { status: 405 });
		}

		const authorisation = request.headers.get("Authorization");

		if (!authorisation?.startsWith("Bearer ")) {
			return new Response("Unauthorised.", { status: 401 });
		}

		let service: Services | null;

		switch (authorisation.slice(authorisation.indexOf(" ") + 1)) {
			case env.AUTHENTICATION_CAELUS:
				service = Service.Caelus;
				break;
			default:
				service = null;
		}

		if (service === null) {
			return new Response("Unauthorised.", { status: 401 });
		}

		await env.FLIGHT_CHECK.put(String(service), String(Date.now()), { expirationTtl: 60 });
		return new Response("Checked in.", { status: 200 });
	},
} satisfies ExportedHandler<Env>;
