import type { CrmProfileRecord } from "./profile";
import type { CrmSession } from "./middleware";

export type CrmAuthContext = {
	crmSession: CrmSession;
	crmProfile: CrmProfileRecord;
};
