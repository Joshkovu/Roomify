import { useMemo, useState } from "react";
import CarouselSlide from "./CarouselSlide";
import type { TutorialSlideData } from "./types";

type CarouselContainerProps = {
    slides: TutorialSlideData[];
    currentIndex: number;
    onSwipeNext: () => void;
    onSwipePrev: () => void;
    reducedMotion: boolean;
};

const SWIPE_THRESHOLD = 50;

const CarouselContainer = ({
    slides,
    currentIndex,
    onSwipeNext,
    onSwipePrev,
    reducedMotion,
}: CarouselContainerProps) => {
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    const trackStyle = useMemo(
        () => ({
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: reducedMotion ? "none" : "transform 420ms ease-in-out",
        }),
        [currentIndex, reducedMotion],
    );

    return (
        <div
            className="tutorial-carousel"
            onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
            onTouchEnd={(event) => {
                const endX = event.changedTouches[0]?.clientX;
                if (touchStartX === null || typeof endX !== "number") return;
                const delta = touchStartX - endX;
                if (delta > SWIPE_THRESHOLD) onSwipeNext();
                if (delta < -SWIPE_THRESHOLD) onSwipePrev();
                setTouchStartX(null);
            }}
        >
            <div className={`tutorial-track ${reducedMotion ? "is-reduced-motion" : ""}`} style={trackStyle}>
                {slides.map((slide, index) => (
                    <div
                        className="tutorial-slide-frame"
                        key={slide.id}
                        role="group"
                        aria-label={`Slide ${index + 1} of ${slides.length}`}
                        aria-hidden={index !== currentIndex}
                    >
                        <CarouselSlide slide={slide} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CarouselContainer;
