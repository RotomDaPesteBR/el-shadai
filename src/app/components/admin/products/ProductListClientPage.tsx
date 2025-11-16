'use client';

import Modal from '@/components/shared/Modal';
import Textbox from '@/components/shared/Textbox/Textbox';
import { toFormattedPrice } from '@/lib/toFormattedPrice';
import { useTranslations } from 'next-intl';
import Image from 'next/image'; // Import Next.js Image component
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './ProductListClientPage.module.scss';

interface ProductSummary {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string | null;
  categoryId: number;
  categoryName: string;
}

interface ProductListClientPageProps {
  initialProducts: ProductSummary[];
  initialLoading: boolean;
  initialError: string | null;
}

export default function ProductListClientPage({
  initialProducts,
  initialLoading,
  initialError
}: ProductListClientPageProps) {
  const t = useTranslations('Pages.AdminProducts');
  const router = useRouter();
  const products = initialProducts;
  const loading = initialLoading;
  const error = initialError;
  const [searchTerm, setSearchTerm] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(
    null
  );
  const [newStockQuantity, setNewStockQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDeleteModal = (product: ProductSummary) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedProduct(null);
    setShowDeleteModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/v1/admin/products/${selectedProduct.id}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }

      toast.success(t('ProductDeletedSuccessfully'));
      router.refresh(); // Refresh the page to show updated list
      closeDeleteModal();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      toast.error(err.message || t('FailedToDeleteProduct'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStockModal = (product: ProductSummary) => {
    setSelectedProduct(product);
    setNewStockQuantity(product.stock.toString());
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    setSelectedProduct(null);
    setNewStockQuantity('');
    setShowStockModal(false);
  };

  const handleStockChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewStockQuantity(e.target.value);
  };

  const handleStockUpdateConfirm = async () => {
    if (!selectedProduct) return;

    const stockValue = parseInt(newStockQuantity, 10);
    if (isNaN(stockValue) || stockValue < 0) {
      toast.error(t('InvalidStockQuantity'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/v1/admin/products/${selectedProduct.id}/stock`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ stock: stockValue })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update stock');
      }

      toast.success(t('StockUpdatedSuccessfully'));
      router.refresh(); // Refresh the page to show updated list
      closeStockModal();
    } catch (err: any) {
      console.error('Error updating stock:', err);
      toast.error(err.message || t('FailedToUpdateStock'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('Title')}</h2>
        <p>Carregando produtos...</p>
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

      <div className={styles.actions}>
        <Textbox
          placeholder={t('SearchPlaceholder')}
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />
        <Link href="/admin/products/add" className={styles.add_button}>
          {t('AddProduct')}
        </Link>
      </div>

      {filteredProducts.length === 0 ? (
        <p>{t('NoProductsFound')}</p>
      ) : (
        <ul className={styles.product_list}>
          {filteredProducts.map(product => (
            <li key={product.id} className={styles.product_list_item}>
              <div className={styles.product_info}>
                <Image
                  src={product.image ?? '/images/food.png'}
                  alt={product.name}
                  width={50}
                  height={50}
                  className={styles.product_image}
                />
                <div>
                  <h3>{product.name}</h3>
                  <p>
                    {t('Category')}: {product.categoryName}
                  </p>
                  <p>
                    {t('Price')}: {toFormattedPrice(product.price.toString())}
                  </p>
                  <p>
                    {t('Stock')}: {product.stock}
                  </p>
                </div>
              </div>
              <div className={styles.product_actions}>
                <button
                  className={styles.delete_button}
                  onClick={() => openDeleteModal(product)}
                >
                  {t('Delete')}
                </button>
                <button
                  className={styles.update_stock_button}
                  onClick={() => openStockModal(product)}
                >
                  {t('UpdateStock')}
                </button>
                <Link
                  href={`/admin/products/${product.id}`}
                  className={styles.edit_button}
                >
                  {t('Edit')}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title={t('ConfirmDeleteTitle')}
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteModal}
        confirmText={t('Delete')}
        cancelText={t('Cancel')}
        isConfirmDisabled={isSubmitting}
      >
        <p>
          {t('ConfirmDeleteMessage', { productName: selectedProduct?.name || '' })}
        </p>
      </Modal>

      {/* Update Stock Modal */}
      <Modal
        isOpen={showStockModal}
        onClose={closeStockModal}
        title={t('UpdateStockTitle')}
        onConfirm={handleStockUpdateConfirm}
        onCancel={closeStockModal}
        confirmText={t('Update')}
        cancelText={t('Cancel')}
        isConfirmDisabled={isSubmitting}
      >
        <p>{t('CurrentStock', { stock: selectedProduct?.stock ?? 0 })}</p>
        <div className={styles.modal_form_group}>
          <label htmlFor="newStock">{t('NewStockQuantity')}</label>
          <Textbox
            id="newStock"
            type="number"
            value={newStockQuantity}
            onChange={handleStockChange}
            min="0"
            required
          />
        </div>
      </Modal>
    </div>
  );
}
