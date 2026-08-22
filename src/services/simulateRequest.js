// Simula a latência de uma chamada de API real. Todos os services usam
// este helper para que a troca dos mocks por chamadas HTTP futuras não
// exija mudanças na camada de páginas/hooks (que já lida com Promises).
export function simulateRequest(data, { delayMs = 400, failRate = 0 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failRate > 0 && Math.random() < failRate) {
        reject(new Error("Falha simulada de comunicação com o serviço."));
        return;
      }
      resolve(data);
    }, delayMs);
  });
}
