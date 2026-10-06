import React, { useState } from 'react';
import { getCategoryThumbnail, getCategorySvgThumbnail, getCategoryInfo } from '../data/categoryThumbnails';

interface CategoryThumbnailImageProps {
  category?: string;
  thumbnail?: string;
  businessName?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  className?: string;
  style?: React.CSSProperties;
  showCategoryBadge?: boolean;
}

export const CategoryThumbnailImage: React.FC<CategoryThumbnailImageProps> = ({
  category,
  thumbnail,
  businessName,
  size = 50,
  width,
  height,
  borderRadius = 12,
  className,
  style,
  showCategoryBadge = false,
}) => {
  const finalWidth = width || size;
  const finalHeight = height || size;
  const categoryInfo = getCategoryInfo(category, businessName);

  const initialSrc = getCategoryThumbnail(category, thumbnail, businessName);
  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  // Sync if prop thumbnail changes
  React.useEffect(() => {
    setImgSrc(getCategoryThumbnail(category, thumbnail, businessName));
    setHasError(false);
  }, [thumbnail, category, businessName]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Fallback directly to SVG vector thumbnail
      setImgSrc(getCategorySvgThumbnail(category, businessName));
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: finalWidth,
        height: finalHeight,
        flexShrink: 0,
        display: 'inline-block',
      }}
    >
      <img
        src={imgSrc}
        alt={businessName || category || 'Business thumbnail'}
        onError={handleError}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          borderRadius,
          objectFit: 'cover',
          border: 'none',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)',
          backgroundColor: '#F8FAFC',
          display: 'block',
          ...style,
        }}
      />
      {showCategoryBadge && (
        <span
          style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: categoryInfo.color,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            border: '2px solid #FFFFFF',
          }}
          title={categoryInfo.name}
        >
          ●
        </span>
      )}
    </div>
  );
};
