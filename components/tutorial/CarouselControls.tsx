import Button from "../Button";

type CarouselControlsProps = {
    currentIndex: number;
    total: number;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
    onComplete: () => void;
};

const CarouselControls = ({
    currentIndex,
    total,
    onNext,
    onPrev,
    onSkip,
    onComplete,
}: CarouselControlsProps) => {
    const isLastSlide = currentIndex === total - 1;

    return (
        <div className="tutorial-controls">
            <Button size="sm" variant="ghost" onClick={onSkip} className="skip">
                Skip
            </Button>
            <div className="nav">
                <Button size="sm" variant="outline" onClick={onPrev} disabled={currentIndex === 0}>
                    Previous
                </Button>
                {isLastSlide ? (
                    <Button size="sm" onClick={onComplete} className="complete">
                        Get Started
                    </Button>
                ) : (
                    <Button size="sm" onClick={onNext} className="next">
                        Next
                    </Button>
                )}
            </div>
        </div>
    );
};

export default CarouselControls;
