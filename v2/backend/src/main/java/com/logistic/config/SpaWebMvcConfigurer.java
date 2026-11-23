package com.logistic.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Directs frontend single-page application (SPA) client-side routes to index.html
 * while allowing static assets and API requests to be served directly.
 */
@Configuration
public class SpaWebMvcConfigurer implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        if (resourcePath == null || resourcePath.isEmpty() || resourcePath.equals("/")) {
                            return location.createRelative("index.html");
                        }
                        Resource requestedResource = location.createRelative(resourcePath);
                        // If exact static file exists on classpath (css, js, png, svg, favicon), serve it
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        // Do not intercept backend REST APIs or Swagger OpenAPI
                        if (resourcePath.startsWith("api/") 
                                || resourcePath.startsWith("api-docs") 
                                || resourcePath.startsWith("swagger-ui")) {
                            return null;
                        }
                        // Fall back to index.html for all deep client-side React routes
                        return location.createRelative("index.html");
                    }
                });
    }
}
