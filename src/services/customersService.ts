import { matchCustomersByGeocodes } from "./geoMatch";
import { getTestCustomers } from "./testCustomersSource";
import type { Customer } from "../types/customer";
import { simulateDelay } from "./simulateDelay";

export async function getAllCustomers(): Promise<Customer[]> {
  return simulateDelay(await getTestCustomers());
}

export async function getCustomersForEvent(
  _eventId: string,
  geocodesMunicipios: string[] = [],
): Promise<Customer[]> {
  const customers = await getTestCustomers();
  return simulateDelay(matchCustomersByGeocodes(customers, geocodesMunicipios));
}
