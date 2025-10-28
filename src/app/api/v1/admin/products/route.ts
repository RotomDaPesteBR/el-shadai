import { NextResponse } from 'next/server';
import { ProductsService } from '@/services/ProductsService';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const categoryId = parseInt(formData.get('categoryId') as string);
    const imageFile = formData.get('image') as File;

    if (!name || !price || isNaN(price) || !stock || isNaN(stock) || !categoryId || isNaN(categoryId) || !imageFile) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let imageUrl: string | undefined;
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = await uploadImageToCloudinary(buffer);
    }

    const newProduct = await ProductsService.createProduct({
      name,
      description,
      price,
      stock,
      categoryId,
      image: imageUrl,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
}
