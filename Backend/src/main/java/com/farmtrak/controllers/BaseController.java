// Backend/src/main/java/com/farmtrak/controllers/BaseController.java
package com.farmtrak.controllers;

import com.farmtrak.model.BaseEntity;  // ← ADD THIS
import com.farmtrak.repository.BaseRepository;  // ← ADD THIS
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.function.BiConsumer;

public abstract class BaseController<T extends BaseEntity, ID> {
    
    private final BaseRepository<T, ID> repository;
    private final BiConsumer<T, T> updateFunction;

    protected BaseController(BaseRepository<T, ID> repository, BiConsumer<T, T> updateFunction) {
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
    public T update(@PathVariable ID id, @RequestBody T updated, @RequestHeader("X-User-Email") String userEmail) {
        return repository.findById(id)
                .map(existing -> {
                    if (!existing.getUserEmail().equals(userEmail)) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
                    }
                    updateFunction.accept(existing, updated);
                    return repository.save(existing);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entity not found"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable ID id, @RequestHeader("X-User-Email") String userEmail) {
        T entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entity not found"));
        if (!entity.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        repository.deleteById(id);
    }
}