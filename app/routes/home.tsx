import { ArrowRight, ArrowUpRight, Clock, Layers, Share2, Sparkles, UploadCloud, WandSparkles } from "lucide-react";
import Navbar from "../../components/Navbar";
import type { Route } from "./+types/home";
import Button from "../../components/Button";
import Upload from "../../components/Upload";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { createProject, getProjects  } from "../../lib/puter.action";
import TutorialCarousel from "../../components/tutorial/TutorialCarousel";
import type { TutorialSlideData } from "../../components/tutorial/types";
import { ONBOARDING_COMPLETED_KEY } from "../../lib/constants";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [projects,setProjects] = useState<DesignItem[]>([]);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
const isCreatingProjectRef = useRef(false);
  const tutorialSlides: TutorialSlideData[] = [
    {
      id: "welcome",
      title: "Welcome to Roomify",
      description: "Turn static floor plans into photorealistic top-down renders in minutes.",
      icon: <Sparkles className="slide-icon" />,
      highlight: "Tip: Start with a clean PNG/JPG for best visual output.",
    },
    {
      id: "upload",
      title: "Upload Your Blueprint",
      description: "Use the upload panel to drop your plan and create a new project instantly.",
      icon: <UploadCloud className="slide-icon" />,
      highlight: "Supports high-quality PNG and JPG plans up to 50MB.",
    },
    {
      id: "generate",
      title: "Generate Before vs After",
      description: "Roomify runs AI rendering and gives you an interactive compare slider to inspect results.",
      icon: <WandSparkles className="slide-icon" />,
      highlight: "Drag the slider to validate geometry and material quality.",
    },
    {
      id: "share",
      title: "Share or Keep Private",
      description: "Control visibility with one click. Share publicly, or unshare to return to private storage.",
      icon: <Share2 className="slide-icon" />,
      highlight: "You stay in control of visibility at all times.",
    },
  ];

  const handleUploadComplete = async (base64Image: string) => {
    try{
    if(isCreatingProjectRef.current) return false;
    isCreatingProjectRef.current = true;
   const newId = Date.now().toString(); 
   const name = `Residence ${newId}`;
   const newItem = {
    id: newId,
    name,
    sourceImage: base64Image,
    renderedImage:undefined,
    timestamp: Date.now(),
   }
   const saved = await createProject({item: newItem, visibility: "private"});
   if(!saved){
    alert("Failed to save project. Please try again.");
    return false;
   }
   setProjects([saved,...projects]);
   navigate(`/visualizer/${newId}`,{
    state: {
      initialImage:saved.sourceImage,
      initialRendered: saved.renderedImage || null,
      name: saved.name
    }
   });
   return true;
  }finally{
    isCreatingProjectRef.current = false;
  }}
  useEffect(() => {
    const fetchProjects = async () => {
      const items = await getProjects();
      setProjects(items!);
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasCompletedOnboarding = window.localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
    if (!hasCompletedOnboarding) {
      setIsTutorialOpen(true);
    }
  }, []);
  const navigate = useNavigate();
  

  return (<div className="home">
    <Navbar />
    <section className="hero">
      <div className="announce">
        <div className="dot">
          <div className="pulse">

          </div>
        </div>
        <p>Introducing Roomify 2.0</p>
      </div>
 <h1>Build beautiful spaces at the speed of thought with Roomify</h1>
 <p className="subtitle">Roomify is an AI-first design environment that helps you visualize, render and  ship architectural projects faster than ever </p>
    
    <div className="actions">
      <a href="#upload" className="cta">Start building <ArrowRight className="icon" /></a>
      <Button variant="outline" size="lg" className="demo" onClick={() => setIsTutorialOpen(true)}>
        Watch Demo
      </Button>
    </div>
    <div id="upload" className="upload-shell">
      <div className="grid-overlay"/>
      <div className="upload-card">
        <div className="upload-head">
          <div className="upload-icon">
            <Layers className="icon"/>
          </div>
          <h3>Upload your floor plan</h3>
          <p>Supports JPG, PNG, formats upto 50MBs</p>
        </div>
          <Upload onComplete={handleUploadComplete} />
      </div>
    </div>
    </section>
    <section className="projects">
      <div className="section-inner">
        <div className="section-head">
          <div className="copy">
            <h2>Projects</h2>
            <p>Your latest work and shared community projects in one place </p>
          </div>
        </div>
        <div className="projects-grid">
          {projects.map((project) => (
            <div className="project-card group" key={project.id} onClick={() => navigate(`/visualizer/${project.id}`)}>
              <div className="preview">
                <img src={project.renderedImage ?? project.sourceImage ?? undefined} alt={project.name ?? "Project image"} />
                <div className="badge">
                  <span>Community</span>
                </div>
              </div>
              <div className="card-body">
                <div>
                  <h3>{project.name}</h3>
                  <div className="meta">
                    <Clock size={12}/>
                    <span>{new Date(project.timestamp).toLocaleDateString()}</span>
                    <span>By Joash</span>
                  </div>
                </div>
                <div className="arrow">
                  <ArrowUpRight size={18}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    <TutorialCarousel
      isOpen={isTutorialOpen}
      slides={tutorialSlides}
      storageKey={ONBOARDING_COMPLETED_KEY}
      onClose={() => setIsTutorialOpen(false)}
    />
    </div>
  );
}
