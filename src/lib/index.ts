// src/lib/index.ts - Barrel file for simplified imports

// Auth exports
export {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
} from "./auth";

// Middleware exports
export {
  authenticateUser,
  isAdmin,
  isSameUserOrAdmin,
  type AuthRequest,
} from "./middleware";

// Prisma client export
export { prisma } from "./prisma";

// Comment service exports
export {
  CommentService,
  type CommentCreateInput,
  type CommentUpdateInput,
  type CommentResponse,
} from "./commentService";

// Post service exports
export {
  PostService,
  type PostCreateInput,
  type PostUpdateInput,
  type PostResponse,
} from "./postService";

// User service exports
export {
  UserService,
  type UserCreateInput,
  type UserLoginInput,
  type UserUpdateInput,
  type UserResponse,
  type AuthResponse,
} from "./userService";
