package com.budgettracker.exception;

/** 400 — bad request / business rule violation. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
