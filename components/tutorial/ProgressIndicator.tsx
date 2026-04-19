type ProgressIndicatorProps = {
    total: number;
    currentIndex: number;
    onSelect: (index: number) => void;
};

const ProgressIndicator = ({ total, currentIndex, onSelect }: ProgressIndicatorProps) => {
    const percentage = ((currentIndex + 1) / total) * 100;

    return (
        <div className="tutorial-progress" aria-label="Tutorial progress">
            <div className="bar" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={currentIndex + 1}>
                <span style={{ width: `${percentage}%` }} />
            </div>
            <div className="dots" role="tablist" aria-label="Slide navigation">
                {Array.from({ length: total }).map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        role="tab"
                        aria-selected={index === currentIndex}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`dot ${index === currentIndex ? "active" : ""}`}
                        onClick={() => onSelect(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProgressIndicator;
