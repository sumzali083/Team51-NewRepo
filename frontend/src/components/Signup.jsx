import React, { useState } from 'react';
import api from "../api";

export const Signup = () => {

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [username, setUsername] = useState("");
const [error, setError] = useState(null);
const [showPassword, setShowPassword] = useState(false);

async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!username || !email || !password) {
        setError("All fields are required");
        return;
    }

    if (password.length < 8) {
        setError ("Password must be at least 8 characters.");
        return;
    }

    try {
        await api.post("/api/users/register", {
            name: username,
            email: email.trim(),
            password
        });

        alert ("Account created successfully");

    } catch (err) {
        setError (
            err?.response?.data?.message ||
            "Signup failed. Try again."
        );
    }

    }

    return (
        <div style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 6, color: '#ff5a00' }}>Sign Up</h1>
                <p style={{ color: '#bbb', fontSize: 15 }}>Create an account to get started!</p>
            </div>

            {error && (
                <div style={{marginBottom: 12, color: '#f87171', fontSize: 13 }}>
                    {error}
                    </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ background: '#222', border: '1px solid #333', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 16, outline: 'none' }} 
                    placeholder="Username" 
                />

                <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ background: '#222', border: '1px solid #333', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 16, outline: 'none' }} 
                    placeholder="Email"
                />
                
                <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ background: '#222', border: '1px solid #333', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 16, outline: 'none' }}
                    placeholder="Password"
                />

                <button
                    type="submit" 
                    style={{ background: '#ff5a00', color: '#fff', borderRadius: 8, padding: '13px 0', fontWeight: 700, fontSize: 17, border: 'none', cursor: 'pointer', marginTop: 8, boxShadow: '0 2px 8px rgba(0,0,0,.10)' }}>
                    Sign Up
                </button>
            
            <label style={{fontSize: 12, color: "#aaa"}}>
                <input
                type='checkbox'
                onChange={() => setShowPassword(!showPassword)}
                /> Show password
            </label>
            
            </form>
        </div>

    );
    
}