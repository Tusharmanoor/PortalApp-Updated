package com.jobPortal.portalApp.exception;

public class JobNotFoundException extends RuntimeException {
    public JobNotFoundException(String message)
    {
        super(message);
    }
}
