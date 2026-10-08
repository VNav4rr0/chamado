# Script para iniciar o Backend Spring Boot Simplificado
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host "🚀 Iniciando Backend Central de Chamados (Spring Boot + H2)" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Cyan

cd $PSScriptRoot
mvn spring-boot:run
