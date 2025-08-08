
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { StatsSection } from '@/components/home/stats-section';
import { WhyChooseUs } from '@/components/home/why-choose-us';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <FeaturedProducts />
      <WhyChooseUs />
    </div>
  );
}
