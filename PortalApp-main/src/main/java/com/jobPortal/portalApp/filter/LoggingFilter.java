package com.jobPortal.portalApp.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

        HttpServletRequest httpRequest =(HttpServletRequest) servletRequest;
        HttpServletResponse httpResponse =(HttpServletResponse) servletResponse;
        long start=System.currentTimeMillis();

        System.out.println("=======REQUEST=======");

        System.out.println("Method:" + httpRequest.getMethod());
        System.out.println("URI:" + httpRequest.getRequestURI());
        System.out.println("=====================");

        filterChain.doFilter(
                servletRequest,servletResponse
        );
        long end=System.currentTimeMillis();
        System.out.println("======STATUS======");
        System.out.println("Status: " + httpResponse.getStatus());
        System.out.println("Time Taken : " + (end - start) + " ms");
        System.out.println("==================");

        ;


    }
}
