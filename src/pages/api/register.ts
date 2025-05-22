---
import { UserService, type UserCreateInput, type UserLoginInput } from '../../lib/userService';

export const prerender = false;

if (Astro.request.method === 'POST') {
  try {
    const data = await Astro.request.json();
    
    const { email, password, name } = data;
    
    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: 'Email and password are required' }),
        { status: 400 }
      );
    }
    
    if (!name) {
      return new Response(
        JSON.stringify({ message: 'Name is required' }),
        { status: 400 }
      );
    }
    
    // Create a new user (normal user role = 2)
    const userInput: UserCreateInput = {
      email,
      password,
      name,
      roleId: 2, // Regular user role
    };
    
    const result = await UserService.createUser(userInput);
    
    return new Response(
      JSON.stringify({
        message: 'User registered successfully',
        user: result.user,
        token: result.token
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    return new Response(
      JSON.stringify({ message: error.message || 'Registration failed' }),
      { status: 500 }
    );
  }
} else {
  return new Response(
    JSON.stringify({ message: 'Method not allowed' }),
    { status: 405 }
  );
}
---
