import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        {
          message:
            'Missing required fields: identifier (username or email) and password.'
        },
        { status: 400 }
      );
    }

    // Buscar o usuário e INCLUIR a relação 'role' para obter o nome do role
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }]
      },
      include: {
        role: {
          select: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          message:
            'User registered without a password. Please use another login method (e.g., social login).'
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // Login bem-sucedido: Retorne os dados do usuário, agora com a string do role
    const userForSession = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role.role
    };

    return NextResponse.json(
      { message: 'Login successful!', user: userForSession },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error during login.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
