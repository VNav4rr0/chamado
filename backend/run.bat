@echo off
title Central de Chamados - Backend Spring Boot
echo =============================================================
echo Iniciando Backend Central de Chamados (Spring Boot + H2)
echo Porta 8080 - H2 Console em http://localhost:8080/h2-console
echo =============================================================

cd /d "%~dp0"
mvn spring-boot:run
pause
