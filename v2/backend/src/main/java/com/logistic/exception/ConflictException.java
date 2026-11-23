package com.logistic.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends DomainException {

    public ConflictException(String errorCode, String message) {
        super(errorCode, message, HttpStatus.CONFLICT);
    }
}
