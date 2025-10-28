import { NextResponse } from 'next/server';
import { ProductsService } from '@/services/ProductsService';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const categoryId = parseInt(formData.get('categoryId') as string);
    const imageFile = formData.get('image') as File;

    if (!name || !price || isNaN(price) || !stock || isNaN(stock) || !categoryId || isNaN(categoryId)) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let imageUrl: string | undefined;
    if (imageFile && imageFile.size > 0) { // Check if a new image file is provided
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = await uploadImageToCloudinary(buffer);
    }

    const updatedProduct = await ProductsService.updateProduct(Number(productId), {
      name,
      description,
      price,
      stock,
      categoryId,
      image: imageUrl, // Only update if a new image was uploaded
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 500 }
    );
  }
}
