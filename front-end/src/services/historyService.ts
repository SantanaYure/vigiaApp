import type {HistoryEntry} from "../types/history";
import {api} from "./api";
export const getHistory=()=>api<HistoryEntry[]>("/api/historico");
