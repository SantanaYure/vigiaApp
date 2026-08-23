import { useAsyncData } from "../../hooks/useAsyncData";
import { getHistory } from "../../services/historyService";

export function useHistoryData() {
  return useAsyncData(getHistory, []);
}
