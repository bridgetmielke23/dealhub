import { notFound } from "next/navigation";
import { mockDeals } from "@/data/mockDeals";
import DealDetailPage from "@/components/DealDetailPage";
import { generateDealSEO, generateDealStructuredData } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const deal = mockDeals.find((d) => d.id === params.id);
  
  if (!deal) {
    return {
      title: "Deal Not Found - DealHub",
    };
  }

  const seo = generateDealSEO(deal);
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords?.join(", "),
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: [deal.image],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [deal.image],
    },
  };
}

export default function DealPage({ params }: { params: { id: string } }) {
  const deal = mockDeals.find((d) => d.id === params.id);

  if (!deal) {
    notFound();
  }

  const structuredData = generateDealStructuredData(deal);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <DealDetailPage deal={deal} />
    </>
  );
}

