'use client';

import { useRef, useState, type ComponentProps } from 'react';
import dynamic from 'next/dynamic';
import DealCardList from './DealCardList';
import { Deal } from '@/types/deal';

// Load MapView only on the client (Leaflet needs window)
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
});

// Take the same props as DealCardList (deals, selectedDealId, onDealSelect, etc.)
type DealsSwipeViewProps = ComponentProps<typeof DealCardList>;

export default function DealsSwipeView(props: DealsSwipeViewProps) {
  const [activeIndex, setActiveIndex] = useState(0); // 0 = List, 1 = Map
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Convert selectedDealId to selectedDeal for MapView
  const selectedDeal = props.selectedDealId 
    ? props.deals.find(d => d.id === props.selectedDealId) || null
    : null;

  // Convert onDealSelect from string to Deal | null for MapView
  const handleMapDealSelect = (deal: Deal | null) => {
    if (deal) {
      props.onDealSelect(deal.id);
    } else {
      // If null, we can't call onDealSelect with null, so we'll just ignore it
      // or find a way to handle this - for now, we'll just not call it
    }
  };

  const handleTabClick = (index: number) => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;

    containerRef.current.scrollTo({
      left: index * width,
      behavior: 'smooth',
    });

    setActiveIndex(index);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Tabs */}
      <div className="flex items-center justify-center gap-4 pb-2">
        <button
          type="button"
          onClick={() => handleTabClick(0)}
          className={`px-4 py-1 rounded-full text-sm font-medium border ${
            activeIndex === 0
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-gray-300'
          }`}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => handleTabClick(1)}
          className={`px-4 py-1 rounded-full text-sm font-medium border ${
            activeIndex === 1
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-gray-300'
          }`}
        >
          Map
        </button>
      </div>

      {/* Swipeable area */}
      <div
        ref={containerRef}
        className="flex w-full flex-1 overflow-x-auto snap-x snap-mandatory scroll-smooth"
      >
        {/* Slide 1: List */}
        <section className="snap-start flex-shrink-0 w-full h-full overflow-y-auto pr-2">
          <DealCardList {...props} />
        </section>

        {/* Slide 2: Map */}
        <section className="snap-start flex-shrink-0 w-full h-full">
          <MapView
            deals={props.deals}
            selectedDeal={selectedDeal}
            onDealSelect={handleMapDealSelect}
            userLocation={undefined}
          />
        </section>
      </div>
    </div>
  );
}
