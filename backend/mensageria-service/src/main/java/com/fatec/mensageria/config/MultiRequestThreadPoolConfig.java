package com.fatec.mensageria.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
public class MultiRequestThreadPoolConfig {

    @Value("${concorrencia.core-pool-size:8}")
    private int corePoolSize;

    @Value("${concorrencia.max-pool-size:32}")
    private int maxPoolSize;

    @Value("${concorrencia.queue-capacity:500}")
    private int queueCapacity;

    @Bean(name = "mensageriaTaskExecutor")
    public ThreadPoolTaskExecutor mensageriaTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("MultiReq-Worker-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
