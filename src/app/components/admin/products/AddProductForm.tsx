"use client";

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import styles from './AddProductForm.module.scss';

interface CategorySummary {
  id: number;
  categoryName: string;
}

interface AddProductFormProps {
  initialLoading: boolean;
  initialError: string | null;
  categories: CategorySummary[];
  categoriesError: string | null;
}

export default function AddProductForm({
  initialLoading,
  initialError,
  categories,
  categoriesError,
}: AddProductFormProps) {
  const t = useTranslations('Pages.AdminAddProduct');
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(initialError || categoriesError);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || !price || !stock || !categoryId || !image) {
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
      const response = await fetch('/api/v1/admin/products', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }

      toast.success(t('ProductAddedSuccessfully'));
      router.push('/admin/products');
    } catch (err: unknown) {
      console.error("Error adding product:", err);
      setError(err instanceof Error ? err.message : t('FailedToAddProduct'));
      toast.error(err instanceof Error ? err.message : t('FailedToAddProduct'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('Title')}</h2>
        <p>Carregando...</p>
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
            required
          />
        </div>
        <button type="submit" className={styles.submit_button} disabled={loading}>
          {loading ? t('AddingProduct') : t('AddProduct')}
        </button>
      </form>
    </div>
  );
}
