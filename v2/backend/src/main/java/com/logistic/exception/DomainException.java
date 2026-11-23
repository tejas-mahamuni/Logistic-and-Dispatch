package com.logistic.exception;

import org.springframework.http.HttpStatus;

public class DomainException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus status;

    public DomainException(String errorCode, String message, HttpStatus status) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }

    /** Convenience constructor — errorCode defaults to the HTTP status name. */
    public DomainException(HttpStatus status, String message) {
        this(status.name(), message, status);
    }

    public String getErrorCode() {
        return errorCode;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
