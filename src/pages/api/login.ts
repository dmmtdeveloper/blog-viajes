import { UserService, type UserLoginInput } from "../../lib";
import type { APIContext } from "astro";

export const prerender = false;

export async function POST({ request }: APIContext) {
  try {
    const data = await request.json();

    const { email, password } = data;

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password are required" }),
        { status: 400 }
      );
    }

    // Login the user
    const loginInput: UserLoginInput = {
      email,
      password,
    };

    try {
      const authResponse = await UserService.loginUser(loginInput);

      return new Response(JSON.stringify(authResponse), { status: 200 });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid credentials";
      return new Response(
        JSON.stringify({ message: errorMessage }),
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error logging in:", error);

    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
