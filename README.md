# Central de Chamados - Portal Front-end Simplificado

Portal web simplificado e objetivo para abertura de chamados técnicos e demonstração visual de **mensageria assíncrona orientada a eventos**, desenvolvido em **React Native for Web**, **TypeScript** e **Material Design 3 (React Native Paper)**.

---

## 🎯 Características do Front-end Simplificado

1. **Formulário Único & Direto**:
   - Campos essenciais de **Título** e **Descrição**.
   - Validação imediata e criação com disparo de mensagem em tempo real.
   - Card com resumo visual do último chamado registrado e confirmado.

2. **Seção Visual de Mensageria & Logs em Tempo Real**:
   - **Pipeline Visual em 4 Etapas**:
     1. 🚀 **Disparo**: Chamado enviado ao broker/fila.
     2. 📥 **Na Fila**: Evento enfileirado (`chamado.criado`).
     3. ⚙️ **Worker**: Consumo assíncrono pelo processador concorrente.
     4. ✅ **Sucesso (ACK)**: Confirmação de recebimento e persistência.
   - **Disparo Manual de Teste**: Botão para simular o tráfego de mensageria avulso a qualquer momento.
   - **Terminal de Eventos**: Log cronológico com badges coloridos, timestamp e descrição detalhada.

3. **Arquitetura Limpa**:
   - Todos os ecrãs secundários, abas complexas, rotas legadas e regras redundantes foram removidos.
   - Código enxuto e de inicialização instantânea.

---

## 🚀 Como Executar o Front-end

Dentro da pasta do projeto:

```bash
cmd /c "npm start"
```

Ou diretamente com o Expo Web:

```bash
cmd /c "npx expo start --web"
```

A aplicação abrirá no seu navegador padrão em `http://localhost:8081`.

---

## 🏛️ Microsserviços Backend (Pasta `backend/`)

Na pasta [`backend/`](file:///c:/Users/Estágio/chamado/backend), você encontra a arquitetura completa de microsserviços Spring Boot com banco H2:
- **`GATEWAY`** (Porta 8080)
- **`LOGIN`** (Porta 8083)
- **`chamado-service`** (Porta 8081)
- **`mensageria-service`** (Porta 8082)

Para iniciar os 4 microsserviços em paralelo:
```powershell
cd backend
.\run-all.ps1
```
