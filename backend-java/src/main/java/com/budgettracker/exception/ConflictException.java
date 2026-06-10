package com.budgettracker.exception;

/** 409 — entity conflict (e.g. duplicate email). */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
