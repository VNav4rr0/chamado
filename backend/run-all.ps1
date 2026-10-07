# Script para iniciar todos os microsserviços Spring Boot em paralelo no Windows

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "🚀 Iniciando Arquitetura de Microsserviços Central de Chamados" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan

$backendDir = $PSScriptRoot

# Função para iniciar um microsserviço em uma nova janela de terminal
function Start-Microservice {
    param (
        [string]$ServiceName,
        [string]$Path,
        [int]$Port
    )

    Write-Host "Iniciando $ServiceName na porta $Port..." -ForegroundColor Green
    $command = "cd '$Path'; Write-Host 'Iniciando $ServiceName na porta $Port...' -ForegroundColor Cyan; mvn spring-boot:run"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "$command"
}

# 1. Inicia o Serviço de Autenticação LOGIN (Porta 8083)
Start-Microservice -ServiceName "LOGIN (Auth)" -Path "$backendDir\LOGIN" -Port 8083

# 2. Inicia o Chamado Service (Porta 8081)
Start-Microservice -ServiceName "chamado-service" -Path "$backendDir\chamado-service" -Port 8081

# 3. Inicia o Mensageria Service (Porta 8082)
Start-Microservice -ServiceName "mensageria-service" -Path "$backendDir\mensageria-service" -Port 8082

# Aguarda 5 segundos para os serviços subirem antes do gateway
Write-Host "Aguardando serviços inicializarem para subir o API GATEWAY..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5

# 4. Inicia o API GATEWAY (Porta 8080)
Start-Microservice -ServiceName "GATEWAY" -Path "$backendDir\GATEWAY" -Port 8080

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "✅ Todos os microsserviços foram disparados em paralelo!" -ForegroundColor Green
Write-Host "🔗 API Gateway:      http://localhost:8080" -ForegroundColor White
Write-Host "🔗 Login Service:    http://localhost:8083 (H2: /h2-console)" -ForegroundColor White
Write-Host "🔗 Chamado Service:  http://localhost:8081 (H2: /h2-console)" -ForegroundColor White
Write-Host "🔗 Mensageria:       http://localhost:8082 (H2: /h2-console)" -ForegroundColor White
Write-Host "📱 Frontend Web:     http://localhost:8081 (via npx expo start --web)" -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Cyan
