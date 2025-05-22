---
import { UserService, type UserLoginInput } from '../../lib/userService';

export const prerender = false;

if (Astro.request.method === 'POST') {
  try {
    const data = await Astro.request.json();
    
    const { email, password } = data;
    
    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: 'Email and password are required' }),
        { status: 400 }
      );
    }
    
    // Login the user
    const loginInput: UserLoginInput = {
      email,
      password,
    };
    
    const result = await UserService.loginUser(loginInput);
    
    return new Response(
      JSON.stringify({
        message: 'Login successful',
        user: result.user,
        token: result.token
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    
    return new Response(
      JSON.stringify({ message: error.message || 'Login failed' }),
      { status: 401 }
    );
  }
} else {
  return new Response(
    JSON.stringify({ message: 'Method not allowed' }),
    { status: 405 }
  );
}
---
