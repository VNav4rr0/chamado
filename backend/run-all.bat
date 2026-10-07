@echo off
title Iniciar Microsservicos Chamados (GATEWAY + LOGIN + Chamado + Mensageria)
echo ================================================================
echo Iniciando Microsservicos Spring Boot em Paralelo...
echo ================================================================

cd /d "%~dp0"

start "LOGIN Service (Porta 8083)" cmd /k "cd LOGIN && mvn spring-boot:run"
start "Chamado Service (Porta 8081)" cmd /k "cd chamado-service && mvn spring-boot:run"
start "Mensageria Service (Porta 8082)" cmd /k "cd mensageria-service && mvn spring-boot:run"

echo Aguardando 5 segundos antes de iniciar o API Gateway...
timeout /t 5 /nobreak >nul

start "GATEWAY (Porta 8080)" cmd /k "cd GATEWAY && mvn spring-boot:run"

echo.
echo Todos os servicos foram iniciados em janelas dedicadas!
echo Gateway unificado disponivel em http://localhost:8080
pause
