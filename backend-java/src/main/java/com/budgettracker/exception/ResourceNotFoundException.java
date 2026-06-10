package com.budgettracker.exception;

/** 404 — resource not found. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public static ResourceNotFoundException of(String entity, Object id) {
        return new ResourceNotFoundException(entity + " not found with id: " + id);
    }
}
