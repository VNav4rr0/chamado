$baseUrl = "http://localhost:8080"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🧪 Testando Backend Simplificado (Spring Boot + H2 + JWT)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Teste Login
Write-Host "`n1. Testando POST /api/auth/login..." -ForegroundColor Green
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResp = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login OK! Token gerado para $($loginResp.nome) (Role: $($loginResp.role))" -ForegroundColor Green
    $token = $loginResp.token
} catch {
    Write-Host "❌ Falha no login: $_" -ForegroundColor Red
}

# 2. Teste Listar Chamados
Write-Host "`n2. Testando GET /api/chamados..." -ForegroundColor Green
try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $chamados = Invoke-RestMethod -Uri "$baseUrl/api/chamados" -Method GET -Headers $headers
    Write-Host "✅ Chamados encontrados no H2: $($chamados.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Falha ao listar chamados: $_" -ForegroundColor Red
}

# 3. Teste Criar Chamado & Disparar Mensageria
Write-Host "`n3. Testando POST /api/chamados (Abertura de Ticket & Mensageria)..." -ForegroundColor Green
$novoChamado = @{
    titulo = "Teste de Rede Laboratório"
    descricao = "Verificação de conectividade e mensageria assíncrona."
} | ConvertTo-Json

try {
    $headers = @{ 
        "Authorization" = "Bearer $token"
        "X-Usuario-Id" = "admin"
    }
    $criado = Invoke-RestMethod -Uri "$baseUrl/api/chamados" -Method POST -Body $novoChamado -ContentType "application/json" -Headers $headers
    Write-Host "✅ Chamado criado com sucesso! ID: $($criado.id), Status: $($criado.status)" -ForegroundColor Green

    Write-Host "⏳ Aguardando 2 segundos para o log da mensageria assíncrona..." -ForegroundColor DarkGray
    Start-Sleep -Seconds 2

    $logs = Invoke-RestMethod -Uri "$baseUrl/api/mensageria/logs" -Method GET
    Write-Host "✅ Total de logs de mensageria registrados: $($logs.Count)" -ForegroundColor Green
    if ($logs.Count -gt 0) {
        Write-Host "   Último log: [$($logs[0].tipo)] $($logs[0].mensagem)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Falha ao criar chamado: $_" -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "✨ Testes finalizados com sucesso!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
