import type { Customer } from "../types/customer";

/** Segurados, dentre os informados, cujo `codigoIbge` está entre os municípios afetados. */
export function matchCustomersByGeocodes(customers: Customer[], geocodesMunicipios: string[]): Customer[] {
  if (geocodesMunicipios.length === 0) return [];
  const geocodeSet = new Set(geocodesMunicipios);
  return customers.filter((customer) => geocodeSet.has(customer.codigoIbge));
}
