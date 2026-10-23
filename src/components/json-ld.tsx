type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** Structured data (schema.org) cho Google rich results. Escape "<" để chống XSS. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
