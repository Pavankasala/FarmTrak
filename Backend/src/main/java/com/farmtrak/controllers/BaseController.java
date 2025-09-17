package com.farmtrak.controllers;

import com.farmtrak.model.BaseEntity;
import com.farmtrak.repository.BaseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.function.BiConsumer;

public abstract class BaseController<T extends BaseEntity, ID> {

    private final BaseRepository<T, ID> repository;
    private final BiConsumer<T, T> updateFunction;

    public BaseController(BaseRepository<T, ID> repository, BiConsumer<T, T> updateFunction) {
        this.repository = repository;
        this.updateFunction = updateFunction;
    }

    @GetMapping
    public List<T> getAll(@RequestHeader("X-User-Email") String userEmail) {
        return repository.findByUserEmail(userEmail);
    }

    @PostMapping
    public T create(@RequestBody T entity, @RequestHeader("X-User-Email") String userEmail) {
        entity.setUserEmail(userEmail);
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public T update(@PathVariable ID id, @RequestBody T updatedEntity, @RequestHeader("X-User-Email") String userEmail) {
        return repository.findById(id).map(entity -> {
            authorize(entity.getUserEmail(), userEmail);
            updateFunction.accept(entity, updatedEntity);
            return repository.save(entity);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entity not found"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable ID id, @RequestHeader("X-User-Email") String userEmail) {
        T entity = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entity not found"));
        authorize(entity.getUserEmail(), userEmail);
        repository.deleteById(id);
    }

    protected void authorize(String entityEmail, String userEmail) {
        if (!entityEmail.equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized for this action.");
        }
    }
}