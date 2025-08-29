//Backend\src\main\java\com\farmtrak\model\LoginRequest.java
package com.farmtrak.model;

public class LoginRequest {
    private String username;
    private String password;

    public LoginRequest() {}

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
