import { UserService, type UserCreateInput } from "../../lib";
import type { APIContext } from "astro";

export const prerender = false;

export async function POST({ request }: APIContext) {
  try {
    const data = await request.json();

    const { email, password, name } = data;

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password are required" }),
        { status: 400 }
      );
    }

    if (!name) {
      return new Response(JSON.stringify({ message: "Name is required" }), {
        status: 400,
      });
    }

    // Check if user already exists
    try {
      // Create the user
      const createInput: UserCreateInput = {
        email,
        password,
        name,
        roleId: 2, // Assuming 2 is the user role
      };

      const authResponse = await UserService.createUser(createInput);

      return new Response(JSON.stringify(authResponse), { status: 201 });
    } catch (error: any) {
      // Handle specific errors
      if (error.message.includes("Unique constraint failed")) {
        return new Response(
          JSON.stringify({ message: "Email already exists" }),
          { status: 400 }
        );
      }

      throw error;
    }
  } catch (error: any) {
    console.error("Error registering user:", error);

    return new Response(
      JSON.stringify({ message: error.message || "Failed to register user" }),
      { status: 500 }
    );
  }
}
