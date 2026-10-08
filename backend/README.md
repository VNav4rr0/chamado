# 🏛️ Central de Chamados - Ecossistema Integrado de Microsserviços

Solução integrada de microsserviços em **Spring Boot 3**, **Spring Cloud Gateway**, banco de dados **H2** isolado por serviço e **Mensageria Interna Concorrente** (padrão `multi_request`), conectando os repositórios:

- **Front-end**: [https://github.com/VNav4rr0/chamado](https://github.com/VNav4rr0/chamado)
- **Serviço de Login (Auth)**: [https://github.com/VNav4rr0/LOGIN](https://github.com/VNav4rr0/LOGIN)
- **API Gateway**: [https://github.com/ViniciusVChabariberi/GATEWAY](https://github.com/ViniciusVChabariberi/GATEWAY)
- **Microsserviço de Chamados**: `chamado-service` (CRUD, H2, emissão de eventos assíncronos)
- **Microsserviço de Mensageria**: `mensageria-service` (Workers concorrentes, simulação multi_request)

---

## 📐 Topologia de Comunicação e Roteamento

```
               [ Frontend React Native Web ]
                  (Porta 8081 / Expo Web)
                             │
                             ▼ HTTP REST (X-Usuario-Id / Bearer JWT)
               ┌───────────────────────────┐
               │          GATEWAY          │  Porta: 8080
               │  (Spring Cloud Gateway)   │  
               └─────────────┬─────────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │ /api/auth/**        │ /chamados/**        │ /mensageria/**
       │ /auth/**            │ /tecnicos/**        │ /api/mensageria/**
       ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌─────────────────────────┐
│    LOGIN     │      │chamado-serv. │◄────►│   mensageria-service    │
│ (Porta 8083) │      │ (Porta 8081) │Event.│      (Porta 8082)       │
│  H2 isolado  │      │  H2 isolado  │Assín.│ - H2 isolado            │
│VNav4rr0/LOGIN│      │              │      │ - ThreadPool concorrente│
└──────────────┘      └──────────────┘      │ - Simulação MultiRequest│
                                            └─────────────────────────┘
```

---

##  Detalhamento dos Componentes e Ajustes Realizados

### 1. `GATEWAY` (Baseado em `ViniciusVChabariberi/GATEWAY` - Porta 8080)
- **Roteamento Unificado**: Configurado em `application.yaml` para mapear:
  - `/api/auth/**` e `/auth/**` $\rightarrow$ `lb://login-service` (`http://localhost:8083`)
  - `/chamados/**` e `/api/chamados/**` $\rightarrow$ `lb://chamado-service` (`http://localhost:8081`)
  - `/tecnicos/**` e `/api/tecnicos/**` $\rightarrow$ `lb://chamado-service` (`http://localhost:8081`)
  - `/mensageria/**` e `/api/mensageria/**` $\rightarrow$ `lb://mensageria-service` (`http://localhost:8082`)
- **Autenticação JWT & `UsuarioHeadersFilter`**:
  - Quando a requisição traz o token JWT (via header `Authorization: Bearer` ou cookie `tokenAgendaFlow`), o filtro do Gateway valida o token e extrai:
    - `uid`: injetado no cabeçalho downstream como `X-Usuario-Id`
    - `roles`: injetado no cabeçalho downstream como `X-Usuario-Role`
  - Se a requisição não trouxer JWT (acesso direto do portal com credencial padrão), mantém de forma segura o `X-Usuario-Id` enviado pelo frontend (`user-fatec-1`).
- **Segurança (`SecurityConfig.java`)**:
  - Libera as rotas de autenticação (`/api/auth/login`, `/api/auth/register`, etc.).
  - Libera as rotas do portal de chamados e CORS universal para navegadores desktop e móveis (`http://localhost:8081`, `http://localhost:19006`, etc.).

### 2. `LOGIN` (Baseado em `VNav4rr0/LOGIN` - Porta 8083)
- **Migração para H2**: Configurado para rodar com banco de dados em memória `jdbc:h2:mem:logindb` e console em `http://localhost:8083/h2-console`.
- **Compatibilidade de Token com o Gateway**:
  - O `JwtTokenProvider` assina o JWT com HMAC-SHA256 usando o segredo compartilhado (`JWT_SECRET`).
  - Inclui as claims essenciais:
    - `sub`: username
    - `uid`: identificador do usuário
    - `roles`: lista de permissões (`["ROLE_USER"]`, `["ROLE_ADMIN"]`)
- **Endpoints**:
  - `POST /api/auth/login` e `POST /auth/login`: Autentica usuário e retorna token JWT.
  - `POST /api/auth/register` e `POST /auth/register`: Cria novo usuário com senha criptografada em BCrypt.
  - `GET /api/auth/me` e `GET /auth/me`: Retorna informações do usuário atual.
- **Carga Inicial no H2**: Inicializa automaticamente o usuário padrão `user-fatec-1` (senha `123456`) e `admin` (senha `admin123`).

### 3. `chamado-service` (Porta 8081 - Banco H2 `jdbc:h2:mem:chamadodb`)
- **Atendimento às Rotas do Frontend**:
  - `GET /chamados`: Retorna a lista de chamados ordenada por data decrescente (com filtro por `X-Usuario-Id`).
  - `GET /chamados/{id}`: Retorna os detalhes completos do ticket e a linha do tempo com histórico cronológico.
  - `POST /chamados`: Cria ticket com status `ABERTO`, grava primeiro evento no histórico, dispara evento assíncrono para a mensageria e retorna `HTTP 202 Accepted`.
  - `PATCH /chamados/{id}/resolver`: Finaliza chamado, libera carga do técnico associado (`-1`) e notifica o serviço de mensageria para acionar desrepresamento.
  - `GET /tecnicos/carga`: Retorna o painel com os 8 técnicos e percentual geral de ocupação.
  - `PUT /chamados/{id}/atribuicao`: Callback assíncrono consumido pelo `mensageria-service` para definir técnico, protocolo e prazo de SLA.
- **Carga Inicial no H2**: 8 técnicos oficiais e 4 chamados de demonstração (`c-101`, `c-102`, `c-103`, `c-104`).

### 4. `mensageria-service` (Porta 8082 - Banco H2 `jdbc:h2:mem:mensageriadb`)
- **Motor Concorrente Multithread (Padrão `multi_request`)**:
  - Utiliza `ThreadPoolTaskExecutor` com pool ajustável (`core-pool-size: 8`, `max-pool-size: 32`, fila: 500 tarefas).
  - Simula latência de fila de mensagens assíncronas (~1800ms).
  - Alocação inteligente: consulta técnicos da especialidade no `chamado-service`, escolhe o de menor carga, calcula o prazo de SLA (4h, 8h, 24h, 72h), gera protocolo sequencial (`CH-2026-000106`) e atualiza o ticket para `EM_ATENDIMENTO`.
  - Represamento em fila de espera (`AGUARDANDO_TECNICO`) quando a capacidade dos técnicos estiver esgotada.
  - Desrepresamento automático ao receber notificação de chamado resolvido.
- **Endpoints de Stress Test Concorrente**:
  - `POST /mensageria/simulador/multi-request`: Dispara N requisições simultâneas em paralelo para testar balanceamento de carga, throughput (RPS) e enfileiramento por saturação.
  - `GET /mensageria/metricas`: Estatísticas do broker, pool de threads ativas e taxa de chamados represados.
  - `GET /mensageria/logs`: Histórico de auditoria persistido no banco H2.

---

## Como Compilar e Rodar Tudo em Paralelo

### Pré-requisitos
- **Java JDK 17** ou superior (`java -version`)
- **Apache Maven 3.8+** (`mvn -version`)
- **Node.js 18+** (`node -v`)

### 1. Compilação Completa dos Microsserviços
Na pasta `chamado/backend`:
```powershell
mvn clean install -DskipTests
```

### 2. Inicialização dos Microsserviços em Paralelo no Windows
Execute o script PowerShell fornecido:
```powershell
.\run-all.ps1
```
*(Ou dê duplo clique no executável em lote `run-all.bat`)*

Quatro janelas do terminal abrirão executando:
1. `LOGIN` na porta **8083**
2. `chamado-service` na porta **8081**
3. `mensageria-service` na porta **8082**
4. `GATEWAY` na porta **8080**

### 3. Validação Automatizada de Todos os Endpoints
Com os serviços ativos, execute:
```powershell
.\test-endpoints.ps1
```

---

## 📱 Conexão com o Front-end

1. Na raiz do projeto (`chamado`), execute:
   ```bash
   npx expo start --web
   ```
2. Abra no navegador (`http://localhost:8081`).
3. Vá em **⚙️ Configurações**:
   - Desative a chave **"Simulador RabbitMQ Embutido"**.
   - Defina a URL Base do Gateway como `http://localhost:8080`.
   - Clique em **"Salvar Parâmetros de Conexão"**.
4. O frontend passará a se comunicar com o **GATEWAY**, autenticar via **LOGIN** e delegar o processamento dos chamados e técnicos ao **chamado-service** e à mensageria concorrente do **mensageria-service**!
