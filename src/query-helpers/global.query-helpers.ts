import { GlobalStatus } from '@nibyou/types';

export const filterDeleted = { status: { $ne: GlobalStatus.DELETED } };
export const filterInactive = { status: { $ne: GlobalStatus.INACTIVE } };
