import { customersMock } from "../mocks/customers";
import type { Customer } from "../types/customer";
import { simulateDelay } from "./simulateDelay";

/**
 * The prototype reuses the same customer pool for every event — there is no
 * per-event filtering in the source design. `eventId` is kept in the
 * signature so callers read naturally and the API can grow real filtering
 * later without changing call sites.
 */
export async function getCustomersForEvent(_eventId: string): Promise<Customer[]> {
  return simulateDelay(customersMock);
}
