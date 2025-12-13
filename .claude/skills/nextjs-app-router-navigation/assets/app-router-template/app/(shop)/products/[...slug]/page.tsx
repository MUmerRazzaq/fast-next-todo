export default function Page({ params }: { params: { slug: string[] } }) {
  return <h1>Product Details: {params.slug.join('/')}</h1>;
}
