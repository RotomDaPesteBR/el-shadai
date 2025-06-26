// src/app/api/v1/products/route.ts
import { auth } from '@/app/auth'; // Mantém para autenticação e RBAC
import { ProductsService } from '@/services/ProductsService'; // Importa o serviço de produtos
import { NextResponse } from 'next/server';

// Não precisamos mais do PrismaClient e ProductType aqui, pois a lógica está no serviço.
// const prisma = new PrismaClient();
// type ProductsType = Array<ProductType>;

export async function GET() {
  try {
    // 1. Chama a lógica de buscar todos os produtos do ProductsService
    const products = await ProductsService.getAllProducts();

    // 2. Retorna a resposta JSON.
    return NextResponse.json({ data: products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products via service in API route:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // 1. Autentica e obtém a sessão
  const session = await auth();

  // Verificação básica de sessão
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Implementa Controle de Acesso Baseado em Função (RBAC)
    // Verifica se o usuário tem a função 'admin'
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Only admin users can create products' },
        { status: 403 }
      );
    }

    // Define a interface para o corpo da requisição POST
    interface CreateProductRequestBody {
      name: string;
      description: string;
      price: number;
      stock: number;
      categoryId: number;
      image?: string | null;
    }

    const body: CreateProductRequestBody = await req.json();
    const { name, description, price, stock, categoryId, image } = body;

    // 3. Validação dos dados de entrada
    if (
      !name ||
      !description ||
      typeof price !== 'number' ||
      typeof stock !== 'number' ||
      typeof categoryId !== 'number'
    ) {
      return NextResponse.json(
        { message: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    // 4. Chama a lógica de criação de produto do ProductsService
    const newProduct = await ProductsService.createProduct({
      name,
      description,
      price,
      stock,
      categoryId,
      image
    });

    return NextResponse.json(newProduct, { status: 201 }); // Retorna o produto criado com status 201 Created
  } catch (error) {
    console.error('Error creating product via service in API route:', error);

    // Trata erros específicos do Prisma ou outros erros lançados pelo serviço
    if (error instanceof Error) {
      const prismaError = error as { code?: string; message: string };

      if (prismaError.code === 'P2003') {
        // Falha de chave estrangeira (e.g., categoryId não existe)
        return NextResponse.json(
          { message: 'Category not found or invalid categoryId' },
          { status: 404 }
        );
      }
      if (prismaError.code === 'P2025') {
        // Nenhum registro encontrado para o ID fornecido (e.g., usuário não encontrado para o email da sessão)
        return NextResponse.json(
          { message: 'User not found in database or user session issue.' },
          { status: 404 }
        );
      }
      // Fallback para outros erros genéricos
      return NextResponse.json(
        { message: 'Failed to create product', error: prismaError.message },
        { status: 500 }
      );
    }

    // Tratamento genérico de erro se não for uma instância de Error
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
