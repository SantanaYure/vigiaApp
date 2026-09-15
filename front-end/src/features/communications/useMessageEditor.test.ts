import {act,renderHook} from "@testing-library/react";
import {it,expect} from "vitest";
import {useMessageEditor} from "./useMessageEditor";
it("mantém seleção vazia sem gerar ou simular comunicações inexistentes",async()=>{
 let sent=0;
 const {result}=renderHook(()=>useMessageEditor(null,()=>{sent++;}));
 await act(async()=>{await result.current.onRegenerate();await result.current.onConfirmSimulate();});
 expect(result.current.text).toBe("");expect(sent).toBe(0);
 act(()=>result.current.onRequestSimulate());expect(result.current.isConfirmOpen).toBe(true);
 act(()=>result.current.onCancelSimulate());expect(result.current.isConfirmOpen).toBe(false);
});
