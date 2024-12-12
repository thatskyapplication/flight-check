export const DEFAULT_EMBED_COLOUR = 0x6f68c9 as const;

export const Service = {
	Caelus: 0,
} as const satisfies Readonly<Record<string, number>>;

export const SERVICE_VALUES = Object.values(Service);
export type Services = (typeof Service)[keyof typeof Service];

export const ServiceToString = {
	[Service.Caelus]: "Caelus",
} as const satisfies Readonly<Record<Services, string>>;
