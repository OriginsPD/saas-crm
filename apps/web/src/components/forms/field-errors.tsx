export function normalizeFieldErrors(errors: unknown[]): string[] {
	return errors.flatMap((error) => {
		if (typeof error === "string") {
			return [error];
		}

		if (
			error &&
			typeof error === "object" &&
			"message" in error &&
			typeof error.message === "string"
		) {
			return [error.message];
		}

		return [];
	});
}

export function FieldErrors({ errors }: { errors?: string[] }) {
	if (!errors?.length) {
		return null;
	}

	return (
		<p className="text-destructive text-xs" role="alert">
			{errors.join(" ")}
		</p>
	);
}

export function FormErrorBanner({ message }: { message: string }) {
	return (
		<div
			className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm"
			role="alert"
			data-testid="form-error-banner"
		>
			{message}
		</div>
	);
}
