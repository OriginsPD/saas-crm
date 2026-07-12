import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

dotenv.config({
	path: resolve(fileURLToPath(new URL(".", import.meta.url)), "../../../../apps/server/.env"),
});
