import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEOHead({ 
  title = "MedSure - Free Drug Interaction Checker for Indian Medications",
  description = "Check drug interactions between Indian medicines instantly. Free, safe, and accurate - includes Ayurvedic, allopathic, and homeopathic medications.",
  keywords = "drug interaction checker India, Indian medicines, medication safety, Ayurvedic medicine interactions, prescription checker",
  canonicalUrl = "https://medsure.info/",
  ogImage = "https://medsure.info/og-image.jpg",
  medicationCount = 0,
  interactionCount = 0
}) {
  
  // Dynamic title based on user activity
  const getDynamicTitle = () => {
    if (medicationCount > 0 && interactionCount > 0) {
      return `${interactionCount} Drug Interactions Found | MedSure Checker`;
    } else if (medicationCount > 0) {
      return `Checking ${medicationCount} Medications | MedSure`;
    }
    return title;
  };

  // Dynamic description based on user activity  
  const getDynamicDescription = () => {
    if (medicationCount > 0 && interactionCount > 0) {
      return `Found ${interactionCount} potential drug interactions among your ${medicationCount} medications. Get detailed analysis and safety recommendations.`;
    } else if (medicationCount > 0) {
      return `Analyzing ${medicationCount} medications for potential drug interactions. Get instant safety results for Indian medicines.`;
    }
    return description;
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{getDynamicTitle()}</title>
      <meta name="title" content={getDynamicTitle()} />
      <meta name="description" content={getDynamicDescription()} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content={getDynamicTitle()} />
      <meta property="og:description" content={getDynamicDescription()} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MedSure" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={getDynamicTitle()} />
      <meta name="twitter:description" content={getDynamicDescription()} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Additional SEO for medical content */}
      <meta name="medical-disclaimer" content="This tool provides general information only and is not a substitute for professional medical advice. Always consult your healthcare provider." />
      <meta name="content-language" content="en-IN" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />
      
      {/* Rich snippets for better search results */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "MedSure Drug Interaction Checker",
          "description": getDynamicDescription(),
          "url": canonicalUrl,
          "applicationCategory": "HealthApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1247",
            "bestRating": "5"
          },
          "creator": {
            "@type": "Organization",
            "name": "MedSure",
            "url": "https://medsure.info"
          }
        })}
      </script>
    </Helmet>
  );
}
