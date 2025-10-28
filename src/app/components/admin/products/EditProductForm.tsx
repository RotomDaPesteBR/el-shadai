"use client";

import styles from 'EditProductForm.module.scss';
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CategorySummary {
  id: number;
  categoryName: string;
}

interface ProductDetails {
  id: number;
  name: string;
  description: string; // Corrected to non-nullable
  price: number;
  stock: number;
  image?: string | null;
  categoryId: number;
}

interface EditProductFormProps {
  initialProduct: ProductDetails | null;
  initialLoading: boolean;
  initialError: string | null;
  productId: string;
  categories: CategorySummary[];
  categoriesError: string | null;
}

export default function EditProductForm({
  initialProduct,
  initialLoading,
  initialError,
  productId,
  categories,
  categoriesError,
}: EditProductFormProps) {
  const t = useTranslations('Pages.AdminEditProduct');
  const router = useRouter();

  const [name, setName] = useState(initialProduct?.name || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [price, setPrice] = useState(initialProduct?.price.toString() || '');
  const [stock, setStock] = useState(initialProduct?.stock.toString() || '');
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId.toString() || '');
  const [image, setImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState(initialProduct?.image || '');
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(initialError || categoriesError);

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setDescription(initialProduct.description);
      setPrice(initialProduct.price.toString());
      setStock(initialProduct.stock.toString());
      setCategoryId(initialProduct.categoryId.toString());
      setCurrentImage(initialProduct.image || '');
    }
    setLoading(initialLoading);
    setError(initialError || categoriesError);
  }, [initialProduct, initialLoading, initialError, categoriesError]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setCurrentImage(URL.createObjectURL(e.target.files[0])); // Show preview
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || !price || !stock || !categoryId) {
      setError(t('AllFieldsRequired'));
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('categoryId', categoryId);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch(`/api/v1/admin/products/${productId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      toast.success(t('ProductUpdatedSuccessfully'));
      router.push('/admin/products');
    } catch (err: unknown) {
      console.error("Error updating product:", err);
      setError(err instanceof Error ? err.message : t('FailedToUpdateProduct'));
      toast.error(err instanceof Error ? err.message : t('FailedToUpdateProduct'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('Title')}</h2>
        <p>Carregando produto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('Title')}</h2>
        <p className={styles.error_message}>{error}</p>
      </div>
    );
  }

  if (!initialProduct) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('Title')}</h2>
        <p>{t('ProductNotFound')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('Title')}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.form_group}>
          <label htmlFor="name">{t('ProductName')}</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.form_group}>
          <label htmlFor="description">{t('ProductDescription')}</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className={styles.form_group}>
          <label htmlFor="price">{t('ProductPrice')}</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            step="0.01"
          />
        </div>
        <div className={styles.form_group}>
          <label htmlFor="stock">{t('ProductStock')}</label>
          <input
            type="number"
            id="stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>
        <div className={styles.form_group}>
          <label htmlFor="category">{t('ProductCategory')}</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">{t('SelectCategory')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.form_group}>
          <label htmlFor="image">{t('ProductImage')}</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          {currentImage && (
            <Image src={currentImage} alt="Product Preview" className={styles.image_preview} />
          )}
        </div>
        <button type="submit" className={styles.submit_button} disabled={loading}>
          {loading ? t('UpdatingProduct') : t('UpdateProduct')}
        </button>
      </form>
    </div>
  );
}


