import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET() {
  try {
    const neighborhoods = await prisma.neighborhood.findMany({
      where: {
        active: true // Filtra por bairros ativos
      },
      select: {
        // Seleciona apenas os campos relevantes da sua modelagem
        id: true,
        description: true,
        zone: true
        // active pode ser omitido se você souber que só retorna ativos
      },
      orderBy: {
        description: 'asc' // Ordena os bairros por description em ordem alfabética
      }
    });

    return NextResponse.json(
      {
        message: 'Active neighborhoods fetched successfully!',
        data: neighborhoods
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching active neighborhoods:', error);
    return NextResponse.json(
      { message: 'Internal server error when fetching active neighborhoods.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: Request) {
  try {
    // 1. Extrair dados do corpo da requisição
    // Os campos devem ser 'description', 'zone' e 'active' (opcional)
    const { description, zone, active } = await req.json();

    // 2. Validação básica dos dados
    if (!description || !zone) {
      return NextResponse.json(
        { message: 'Missing required fields: description, zone.' },
        { status: 400 }
      );
    }

    // 3. Verificar se o bairro já existe (pela descrição e zona)
    const existingNeighborhood = await prisma.neighborhood.findFirst({
      where: {
        description: {
          equals: description,
          mode: 'insensitive' // Busca case-insensitive
        },
        zone: {
          equals: zone,
          mode: 'insensitive' // Busca case-insensitive
        }
      }
    });

    if (existingNeighborhood) {
      return NextResponse.json(
        {
          message: `Neighborhood '${description}' in zone '${zone}' already exists.`
        },
        { status: 409 } // 409 Conflict
      );
    }

    // 4. Criar o novo bairro no banco de dados
    const newNeighborhood = await prisma.neighborhood.create({
      data: {
        description,
        zone,
        active: active !== undefined ? active : true
      }
    });

    // 5. Resposta de sucesso
    return NextResponse.json(
      { message: 'Neighborhood created successfully!', data: newNeighborhood },
      { status: 201 } // 201 Created
    );
  } catch (error) {
    console.error('Error creating neighborhood:', error);
    return NextResponse.json(
      { message: 'Internal server error during neighborhood creation.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
