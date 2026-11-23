package com.logistic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

@SpringBootApplication
@ConfigurationPropertiesScan   // picks up JwtProperties
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class LogisticAndDispatchApplication {

	public static void main(String[] args) {
		SpringApplication.run(LogisticAndDispatchApplication.class, args);
	}

}
