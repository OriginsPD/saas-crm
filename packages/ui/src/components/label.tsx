"use client";

import { cn } from "@portfolio-saas-crm/ui/lib/utils";
import type * as React from "react";

function Label({
	className,
	htmlFor,
	...props
}: React.ComponentProps<"label">) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: Shared label wrapper receives htmlFor or nested control from consuming form fields.
		<label
			htmlFor={htmlFor}
			data-slot="label"
			className={cn(
				"flex select-none items-center gap-2 text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
