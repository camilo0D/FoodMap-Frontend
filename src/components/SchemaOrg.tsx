import { useEffect } from 'react';

interface SchemaOrgProps {
  schema: Record<string, any>;
}

const SchemaOrg = ({ schema }: SchemaOrgProps) => {
  useEffect(() => {
    // Create and inject script tag
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      ...schema,
    });
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
};

export default SchemaOrg;
