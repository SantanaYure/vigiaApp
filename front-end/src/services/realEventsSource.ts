import type {WeatherEvent} from "../types/event";
import {api} from "./api";
export const getRealEvents=()=>api<WeatherEvent[]>("/api/eventos");
