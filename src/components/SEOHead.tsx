import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead = ({
  title = 'FoodMap - Encuentra la mejor comida cerca de ti',
  description = 'Explora restaurantes, revisa su menú y haz pedidos fácilmente desde un mapa interactivo.',
  image = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=630&fit=crop',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
}: SEOHeadProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEOHead;
