package com.logistic.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DomainException.class)
    public ProblemDetail handleDomainException(DomainException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(ex.getStatus(), ex.getMessage());
        problem.setTitle(ex.getErrorCode());
        problem.setType(URI.create("urn:problem-type:" + ex.getErrorCode().toLowerCase()));
        problem.setProperty("errorCode", ex.getErrorCode());
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("traceId", UUID.randomUUID().toString());
        return problem;
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, ex.getMessage());
        problem.setTitle("ACCESS_DENIED");
        problem.setProperty("errorCode", "ACCESS_DENIED");
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationException(MethodArgumentNotValidException ex) {
        var errors = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getDefaultMessage())
                .toList();

        String primaryMessage = errors.isEmpty() ? "Validation failed" : String.join("; ", errors);

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, primaryMessage);
        problem.setTitle("VALIDATION_ERROR");
        problem.setProperty("errorCode", "VALIDATION_ERROR");
        problem.setProperty("message", primaryMessage);
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("invalidFields", errors);
        return problem;
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrityException(org.springframework.dao.DataIntegrityViolationException ex) {
        String msg = "Database integrity constraint violation: " + (ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage());
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, msg);
        problem.setTitle("DATA_INTEGRITY_VIOLATION");
        problem.setProperty("errorCode", "DATA_INTEGRITY_VIOLATION");
        problem.setProperty("message", msg);
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericException(Exception ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected internal error occurred."
        );
        problem.setTitle("INTERNAL_ERROR");
        problem.setProperty("errorCode", "INTERNAL_ERROR");
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}
