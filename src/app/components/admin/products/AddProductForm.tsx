'use client';

import Textbox from '@/components/shared/Textbox/Textbox';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
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
  categoriesError
}: AddProductFormProps) {
  const t = useTranslations('Pages.AdminAddProduct');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(
    initialError || categoriesError
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              setImage(file);
              setImagePreview(URL.createObjectURL(file));
            }
            break;
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || !price || !stock || !categoryId || !image || !minimumStock) {
      setError(t('AllFieldsRequired'));
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('minimumStock', minimumStock);
    formData.append('categoryId', categoryId);
    formData.append('image', image, image.name);

    try {
      const response = await fetch('/api/v1/admin/products', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }

      toast.success(t('ProductAddedSuccessfully'));
      router.push('/admin/products');
    } catch (err: unknown) {
      console.error('Error adding product:', err);
      setError(err instanceof Error ? err.message : t('FailedToAddProduct'));
      toast.error(err instanceof Error ? err.message : t('FailedToAddProduct'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !imagePreview) {
    // Show full page loading only on initial load
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
        <div className={styles.form_grid}>
          <div className={styles.image_column}>
            <div className={styles.form_group}>
              <label htmlFor="image">{t('ProductImage')}</label>
              <div onClick={handleImageClick} className={styles.image_preview}>
                {imagePreview ? (
                  <Image src={imagePreview} alt="Product Preview" fill />
                ) : (
                  <div className={styles.image_placeholder}>
                    Selecione uma imagem
                  </div>
                )}
              </div>
              <input
                type="file"
                id="image"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className={styles.file_input}
              />
            </div>
          </div>

          {/* Fields Column */}
          <div className={styles.fields_column}>
            <div className={styles.form_group}>
              <label htmlFor="name">{t('ProductName')}</label>
              <Textbox
                id="name"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                required
              />
            </div>
            <div className={styles.form_group}>
              <label htmlFor="description">{t('ProductDescription')}</label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className={styles.textarea}
              />
            </div>
            <div className={styles.form_group_inline}>
              <div className={styles.form_group}>
                <label htmlFor="category">{t('ProductCategory')}</label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  required
                  className={styles.select}
                >
                  <option value="">{t('SelectCategory')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.form_group}>
                <label htmlFor="price">{t('ProductPrice')}</label>
                <Textbox
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPrice(e.target.value)
                  }
                  required
                  step="0.01"
                />
              </div>
            </div>
            <div className={styles.form_group_inline}>
              <div className={styles.form_group}>
                <label htmlFor="stock">{t('ProductStock')}</label>
                <Textbox
                  type="number"
                  id="stock"
                  value={stock}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setStock(e.target.value)
                  }
                  required
                />
              </div>
              <div className={styles.form_group}>
                <label htmlFor="minimumStock">{t('MinimumStock')}</label>
                <Textbox
                  type="number"
                  id="minimumStock"
                  value={minimumStock}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setMinimumStock(e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className={styles.submit_button}
          disabled={loading}
        >
          {loading ? t('AddingProduct') : t('AddProduct')}
        </button>
      </form>
    </div>
  );
}
