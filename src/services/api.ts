const API_BASE_URL = 'http://localhost:8080';

export async function postChamado(titulo: string, descricao: string): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`${API_BASE_URL}/chamados`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario-Id': 'user-fatec-1',
      },
      body: JSON.stringify({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria: 'SOFTWARE',
        prioridade: 'MEDIA',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    throw error;
  }
}
