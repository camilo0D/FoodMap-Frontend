/**
 * FT-87: Componente genérico que inyecta JSON-LD en el <head>
 * para cualquier schema de Schema.org
 */
const SchemaOrg = ({ schema }: { schema: Record<string, any> }) => {
  const json = JSON.stringify({
    "@context": "https://schema.org",
    ...schema,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
};

export default SchemaOrg;