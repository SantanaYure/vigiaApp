import type {Customer} from "../types/customer";
import {api} from "./api";
export const getAllCustomers=()=>api<Customer[]>("/api/segurados");
export const getCustomersForEvent=(eventId:string,_geocodesMunicipios:string[]=[])=>api<Customer[]>(`/api/eventos/${encodeURIComponent(eventId)}/segurados`);
