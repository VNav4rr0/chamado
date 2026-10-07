# Script de Teste Automatizado dos Microsserviços
$baseUrl = "http://localhost:8080"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "🧪 Testando Endpoints via Spring Cloud Gateway (8080)" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

# 1. Teste Auth Service
Write-Host "`n1. Testando POST /auth/login..." -ForegroundColor Green
$loginBody = @{
    username = "user-fatec-1"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login bem-sucedido! Token JWT recebido. Usuário: $($loginResp.nome)" -ForegroundColor Green
    $token = $loginResp.token
} catch {
    Write-Host "❌ Falha no login: $_" -ForegroundColor Red
}

# 2. Teste Chamado Service - Listar
Write-Host "`n2. Testando GET /chamados..." -ForegroundColor Green
try {
    $headers = @{ "X-Usuario-Id" = "user-fatec-1" }
    $chamados = Invoke-RestMethod -Uri "$baseUrl/chamados" -Method GET -Headers $headers
    Write-Host "✅ Total de chamados retornados: $($chamados.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Falha ao listar chamados: $_" -ForegroundColor Red
}

# 3. Teste Painel de Técnicos
Write-Host "`n3. Testando GET /tecnicos/carga..." -ForegroundColor Green
try {
    $painel = Invoke-RestMethod -Uri "$baseUrl/tecnicos/carga" -Method GET
    Write-Host "✅ Painel obtido! Ocupação: $($painel.percentualGeral)% ($($painel.totalCarga)/$($painel.totalCapacidade))" -ForegroundColor Green
    Write-Host "   Total de técnicos ativos: $($painel.tecnicos.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Falha ao obter painel de carga: $_" -ForegroundColor Red
}

# 4. Teste Criar Chamado (HTTP 202 Accepted + Disparo de Evento)
Write-Host "`n4. Testando POST /chamados (Criação de Ticket)..." -ForegroundColor Green
$novoChamado = @{
    titulo = "Teste Automatizado de Rede Bloco C"
    descricao = "Verificação de conectividade após manutenção preventiva."
    categoria = "REDE"
    prioridade = "ALTA"
} | ConvertTo-Json

try {
    $headers = @{ "X-Usuario-Id" = "user-fatec-1" }
    $criado = Invoke-RestMethod -Uri "$baseUrl/chamados" -Method POST -Body $novoChamado -ContentType "application/json" -Headers $headers
    Write-Host "✅ Ticket criado! ID: $($criado.id), Status: $($criado.status)" -ForegroundColor Green
    Write-Host "   Mensagem: $($criado.mensagem)" -ForegroundColor Gray
    
    Write-Host "⏳ Aguardando 3 segundos para alocação assíncrona do mensageria-service..." -ForegroundColor DarkGray
    Start-Sleep -Seconds 3

    $detalhe = Invoke-RestMethod -Uri "$baseUrl/chamados/$($criado.id)" -Method GET
    Write-Host "⚡ Chamado após alocação assíncrona:" -ForegroundColor Yellow
    Write-Host "   Status: $($detalhe.status)" -ForegroundColor White
    Write-Host "   Protocolo: $($detalhe.protocolo)" -ForegroundColor White
    Write-Host "   Técnico Alocado: $($detalhe.tecnicoNome)" -ForegroundColor White
    Write-Host "   Prazo SLA: $($detalhe.slaPrazo)" -ForegroundColor White
} catch {
    Write-Host "❌ Falha na criação/atribuição: $_" -ForegroundColor Red
}

# 5. Teste Mensageria Service - Métricas & Multi-Request Simulator
Write-Host "`n5. Testando GET /mensageria/metricas..." -ForegroundColor Green
try {
    $metricas = Invoke-RestMethod -Uri "$baseUrl/mensageria/metricas" -Method GET
    Write-Host "✅ Métricas de mensageria:" -ForegroundColor Green
    Write-Host "   Eventos Recebidos: $($metricas.totalEventosRecebidos)" -ForegroundColor White
    Write-Host "   Alocados com Sucesso: $($metricas.totalAlocadosComSucesso)" -ForegroundColor White
    Write-Host "   Represados em Espera: $($metricas.totalRepresadosFilaEspera)" -ForegroundColor White
    Write-Host "   Threads Ativas no Pool: $($metricas.poolThreadsAtivas)" -ForegroundColor White
} catch {
    Write-Host "❌ Falha nas métricas: $_" -ForegroundColor Red
}

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "✨ Testes finalizados com sucesso!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
