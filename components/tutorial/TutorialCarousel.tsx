import { X } from "lucide-react";
import { useEffect, useState } from "react";
import CarouselContainer from "./CarouselContainer";
import CarouselControls from "./CarouselControls";
import ProgressIndicator from "./ProgressIndicator";
import type { TutorialSlideData } from "./types";

type TutorialCarouselProps = {
    isOpen: boolean;
    slides: TutorialSlideData[];
    storageKey: string;
    onClose: () => void;
};

const TutorialCarousel = ({ isOpen, slides, storageKey, onClose }: TutorialCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setCurrentIndex(0);
    }, [isOpen]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

        const onChange = (event: MediaQueryListEvent) => {
            setReducedMotion(event.matches);
        };

        setReducedMotion(mediaQuery.matches);
        mediaQuery.addEventListener("change", onChange);

        return () => mediaQuery.removeEventListener("change", onChange);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
            if (event.key === "ArrowLeft") setCurrentIndex((prev) => Math.max(prev - 1, 0));
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose, slides.length]);

    if (!isOpen) return null;

    const markCompleted = () => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(storageKey, "true");
        }
    };

    const handleSkip = () => {
        markCompleted();
        onClose();
    };

    const handleComplete = () => {
        markCompleted();
        onClose();
    };

    return (
        <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Product tutorial">
            <div className="tutorial-modal">
                <div className="tutorial-header">
                    <div>
                        <p className="eyebrow">Product Tour</p>
                        <h2>Roomify Quick Start</h2>
                    </div>
                    <button type="button" className="close" onClick={handleSkip} aria-label="Close tutorial">
                        <X className="icon" />
                    </button>
                </div>

                <ProgressIndicator
                    total={slides.length}
                    currentIndex={currentIndex}
                    onSelect={setCurrentIndex}
                />

                <CarouselContainer
                    slides={slides}
                    currentIndex={currentIndex}
                    onSwipeNext={() => setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1))}
                    onSwipePrev={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    reducedMotion={reducedMotion}
                />

                <CarouselControls
                    currentIndex={currentIndex}
                    total={slides.length}
                    onPrev={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    onNext={() => setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1))}
                    onSkip={handleSkip}
                    onComplete={handleComplete}
                />
            </div>
        </div>
    );
};

export default TutorialCarousel;
