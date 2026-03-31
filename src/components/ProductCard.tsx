import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <motion.article
      className="glass-card product-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label={`${product.name} - $${product.price.toFixed(2)}`}
    >
      {/* Image */}
      <div className="product-card__image-wrapper">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
        />
        <span className="product-card__category">{product.category}</span>
        {isOutOfStock && (
          <span className="product-card__badge product-card__badge--out">Out of Stock</span>
        )}
        {isLowStock && (
          <span className="product-card__badge product-card__badge--low">Only {product.stock} left</span>
        )}
      </div>

      {/* Content */}
      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__description">{product.description}</p>

        <div className="product-card__footer">
          <span className="product-card__price">${product.price.toFixed(2)}</span>
          <button
            className="product-card__add-btn"
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
          >
            <ShoppingCart size={16} />
            <span>{isOutOfStock ? 'Unavailable' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
