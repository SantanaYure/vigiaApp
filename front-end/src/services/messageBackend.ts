import {api} from "./api";
export async function regenerarMensagem(communicationId:string):Promise<string> {
  return (await api<{texto:string}>("/api/regenerar-mensagem",{method:"POST",body:JSON.stringify({communicationId})})).texto;
}
