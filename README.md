# Central de Chamados - Aplicação Integrada e Simplificada

Sistema completo e limpo para abertura e gestão de chamados com **Login JWT**, banco **H2 em memória** e **Simulação Interna de Mensageria**, desenvolvido com **Spring Boot 3** no back-end e **React Native Web / Expo** no front-end.

---

## 🎯 Arquitetura Integrada

```
┌─────────────────────────────────┐
│     Front-end (React Native)    │ (Porta 8081 / Expo Web)
│  - Tela de Login com JWT        │
│  - Formulário & Lista Chamados  │
│  - Monitor de Mensageria        │
└────────────────┬────────────────┘
                 │ HTTP REST (JSON + Bearer Token)
                 ▼
┌─────────────────────────────────┐
│     Back-end (Spring Boot 3)    │ (Porta 8080)
│  - Auth & Login Controller      │
│  - Chamados Controller (CRUD)   │
│  - Motor Interno de Mensageria  │
│  - Banco de Dados H2 em Memória │ (jdbc:h2:mem:chamadodb)
└─────────────────────────────────┘
```

---

## 🔑 Credenciais Padrão Pré-Cadastradas

| Usuário | Senha | Papel (Role) | Descrição |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | `ROLE_ADMIN` | Administrador TI |
| **`user`** | `123456` | `ROLE_USER` | Estudante FATEC |

*(Na tela de login, há botões de preenchimento rápido para demonstração instantânea)*

---

## 🚀 Como Executar o Sistema

### 1. Iniciar o Back-end (Spring Boot)
No PowerShell, dentro da pasta `backend`:
```powershell
cd c:\Users\Estágio\chamado\backend
.\run.ps1
```
*(Ou dê duplo clique em `backend/run.bat` ou execute `mvn spring-boot:run`)*

O servidor subirá na porta **8080**. O console do banco H2 fica disponível em `http://localhost:8080/h2-console`.

### 2. Iniciar o Front-end (React Native Web)
No terminal, dentro da pasta raiz `chamado`:
```bash
cmd /c "npm start"
```
*(Ou execute diretamente `cmd /c "npx expo start --web"`)*

Acesse `http://localhost:8081` no seu navegador!

---

## 📱 Fluxo da Aplicação

1. **Tela de Login**: O usuário insere suas credenciais válidas e recebe o token JWT assinado.
2. **Painel de Chamados**:
   - Visualização do perfil autenticado com botão de **Logout (Sair)**.
   - Formulário simples com **Título** e **Descrição** para abrir novos chamados.
   - Listagem em tempo real de todos os chamados gravados no H2.
3. **Monitor Visual de Mensageria**:
   - Sempre que um chamado é aberto, o backend executa em uma thread assíncrona o pipeline de enfileiramento e confirmação (ACK), gerando logs com destaque visual no console do Spring Boot e na tela do usuário.
