package com.farmtrak.controllers;

import java.util.List;
import java.util.function.BiConsumer;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;

import com.farmtrak.model.BaseEntity;
import com.farmtrak.repository.BaseRepository;

import jakarta.servlet.http.HttpServletRequest;

public abstract class BaseController<T extends BaseEntity, ID> {
    
    private final BaseRepository<T, ID> repository;
    private final BiConsumer<T, T> updateFunction;

    protected BaseController(BaseRepository<T, ID> repository, BiConsumer<T, T> updateFunction) {
        this.repository = repository;
        this.updateFunction = updateFunction;
    }

    @GetMapping
    public List<T> getAll(HttpServletRequest request) { 
        String userEmail = (String) request.getAttribute("userEmail"); 
        return repository.findByUserEmail(userEmail);
    }

    @PostMapping
    public T create(@RequestBody T entity, HttpServletRequest request) { 
        String userEmail = (String) request.getAttribute("userEmail");
        entity.setUserEmail(userEmail);
        return repository.save(entity);
    }

    @PutMapping("/{id}")
    public T update(@PathVariable ID id, @RequestBody T updated, HttpServletRequest request) { 
        String userEmail = (String) request.getAttribute("userEmail"); 
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
    public void delete(@PathVariable ID id, HttpServletRequest request) { 
        String userEmail = (String) request.getAttribute("userEmail"); 
        T entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entity not found"));
        if (!entity.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        repository.deleteById(id);
    }
}