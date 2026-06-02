import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
    title?: string;
    description?: string;
    url?: string;
    image?: string;
    keywords?: string;
}

const SEOHead = ({ title, description, url, image, keywords }: SEOHeadProps) => {
    const fullUrl = url || window.location.href;

    return (
        <Helmet>
            {/* FT-95: Meta tags básicos */}
            {title && <title>{title}</title>}
            {description && <meta name="description" content={description} />}
            {keywords && <meta name="keywords" content={keywords} />}
            {fullUrl && <link rel="canonical" href={fullUrl} />}

            {/* FT-96: Open Graph */}
            {title && <meta property="og:title" content={title} />}
            {description && <meta property="og:description" content={description} />}
            {image && <meta property="og:image" content={image} />}
            {fullUrl && <meta property="og:url" content={fullUrl} />}
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="FoodMap" />

            {/* FT-97: Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            {title && <meta name="twitter:title" content={title} />}
            {description && <meta name="twitter:description" content={description} />}
            {image && <meta name="twitter:image" content={image} />}
        </Helmet>
    );
};

export default SEOHead;