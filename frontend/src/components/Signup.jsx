import React from 'react';

export const Signup = () => {
    return (
        <div style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 6, color: '#ff5a00' }}>Sign Up</h1>
                <p style={{ color: '#bbb', fontSize: 15 }}>Create an account to get started!</p>
            </div>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <input style={{ background: '#222', border: '1px solid #333', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 16, outline: 'none' }} type="text" placeholder="Username" />
                <input style={{ background: '#222', border: '1px solid #333', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 16, outline: 'none' }} type="email" placeholder="Email" />
                <input style={{ background: '#222', border: '1px solid #333', borderRadius: 8, padding: '12px 16px', color: '#fff', fontSize: 16, outline: 'none' }} type="password" placeholder="Password" />
                <button type="submit" style={{ background: '#ff5a00', color: '#fff', borderRadius: 8, padding: '13px 0', fontWeight: 700, fontSize: 17, border: 'none', cursor: 'pointer', marginTop: 8, boxShadow: '0 2px 8px rgba(0,0,0,.10)' }}>Sign Up</button>
            </form>
        </div>
    );
}
