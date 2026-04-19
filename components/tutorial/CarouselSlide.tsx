import type { TutorialSlideData } from "./types";

type CarouselSlideProps = {
    slide: TutorialSlideData;
};

const CarouselSlide = ({ slide }: CarouselSlideProps) => {
    return (
        <article className="tutorial-slide" aria-label={slide.title}>
            <div className="visual">
                {slide.icon ? <div className="icon-wrap">{slide.icon}</div> : null}
                <h3>{slide.title}</h3>
                <p>{slide.description}</p>
            </div>
            {slide.highlight ? (
                <aside className="highlight" aria-live="polite">
                    <span>Feature highlight</span>
                    <p>{slide.highlight}</p>
                </aside>
            ) : null}
        </article>
    );
};

export default CarouselSlide;
