import { prisma } from './prisma';
import { hashPassword, comparePassword, generateToken } from './auth';

// User types
export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
  profileImage?: string;
  bio?: string;
  roleId: number;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface UserUpdateInput {
  name?: string;
  profileImage?: string;
  bio?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  profileImage?: string | null;
  bio?: string | null;
  role: {
    id: number;
    name: string;
  };
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

// User service
export const UserService = {
  // Create a new user (register)
  async createUser(data: UserCreateInput): Promise<AuthResponse> {
    const hashedPassword = await hashPassword(data.password);
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        profileImage: data.profileImage,
        bio: data.bio,
        roleId: data.roleId,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    const token = generateToken(user.id, user.roleId);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        bio: user.bio,
        role: {
          id: user.role.id,
          name: user.role.name,
        },
      },
      token,
    };
  },
  
  // Login a user
  async loginUser(data: UserLoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const isPasswordValid = await comparePassword(data.password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    const token = generateToken(user.id, user.roleId);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        bio: user.bio,
        role: {
          id: user.role.id,
          name: user.role.name,
        },
      },
      token,
    };
  },
  
  // Get a user by ID
  async getUserById(userId: number): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!user) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      bio: user.bio,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
    };
  },
  
  // Update a user
  async updateUser(userId: number, data: UserUpdateInput): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      bio: user.bio,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
    };
  },
};
