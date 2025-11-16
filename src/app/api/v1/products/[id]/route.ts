import { ProductsService } from '@/services/ProductsService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const productId = parseInt(id, 10);

    // 1. Validação do ID: verifica se é um número válido
    if (isNaN(productId)) {
      return NextResponse.json(
        { message: 'Invalid product ID provided.' },
        { status: 400 }
      );
    }

    // 2. Chama a lógica de buscar produto por ID do ProductsService
    // O ProductsService.getProductById já retorna o tipo ProductType formatado ou null.
    const product = await ProductsService.getProductById(productId);

    // 3. Verifica se o produto foi encontrado
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found.' },
        { status: 404 }
      );
    }

    // 4. Retorna o produto encontrado com status 200
    // O serviço já retornou o ProductType formatado, então apenas o retorne.
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Error fetching product via service in API route:', error);
    // Erros capturados aqui são geralmente problemas inesperados do serviço (e.g., falha de conexão com DB).
    return NextResponse.json(
      { message: 'Failed to fetch product.' },
      { status: 500 }
    );
  }
  // Não precisamos de `finally { await prisma.$disconnect(); }` aqui,
  // pois o serviço já gerencia a desconexão do Prisma.
}

// Se você tiver outras operações como PUT ou DELETE para /products/[id],
// elas também devem chamar os métodos correspondentes no ProductsService.
/*
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ... lógica de autenticação e validação ...
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const productId = parseInt(id, 10);
  const body = await request.json(); // Obtenha o corpo da requisição

  try {
    // Exemplo: await ProductsService.updateProduct(productId, body);
    // return NextResponse.json({ message: 'Product updated' }, { status: 200 });
  } catch (error) {
    // ... tratamento de erros ...
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ... lógica de autenticação e validação ...
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const productId = parseInt(id, 10);

  try {
    // Exemplo: await ProductsService.deleteProduct(productId);
    // return NextResponse.json({ message: 'Product deleted' }, { status: 204 });
  } catch (error) {
    // ... tratamento de erros ...
  }
}
*/
