import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient().$extends(withAccelerate());

export async function POST(req: Request) {
  try {
    // 1. Extrair dados do corpo da requisição
    const { name, username, email, password, address, neighId } =
      await req.json();

    // 2. Validação básica dos dados
    if (!username || !email || !password || !neighId) {
      return NextResponse.json(
        {
          message:
            'Missing required fields: username, email, password, neighId.'
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 3. Verificar se o username ou email já existem
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: username }
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        { message: 'Username already taken.' },
        { status: 409 }
      );
    }

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { message: 'Email already registered.' },
        { status: 409 }
      );
    }

    // 4. Hashear a senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Criar o novo usuário no banco de dados
    const newUser = await prisma.user.create({
      data: {
        name: name || null,
        username,
        email,
        password: hashedPassword,
        address: address || null,
        roleId: 1, //Customer como role padrão
        neighId: parseInt(neighId, 10)
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        roleId: true,
        neighId: true,
        createdAt: true
      }
    });

    // 6. Resposta de sucesso
    return NextResponse.json(
      { message: 'User registered successfully!', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error during registration.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
