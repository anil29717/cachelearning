import React, { useEffect, useMemo, useState, useRef } from 'react';

type Slide = {
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;
};

const slidesData: Slide[] = [
  {
    title: 'Master the Future with AI, Cloud & Cyber Skills',
    subtitle:
      'Upgrade your career with industry-focused courses in Artificial Intelligence, Data Science, Cloud Computing, Cyber Security, and Networking. Learn from experts, build real projects, and get job-ready.',
    buttonText: 'Explore Courses',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&h=460&fit=crop',
  },
  {
    title: 'Learn Today. Lead Tomorrow.',
    subtitle:
      'Step into the world of next-gen tech with hands-on learning in AI, Data AI, Cloud, Cyber & Networks. Build, practice, grow — your tech journey starts here!',
    buttonText: 'Explore Programs',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=640&h=460&fit=crop',
  },
  {
    title: 'Build In-Demand Tech Skills',
    subtitle:
      'From Machine Learning, Generative AI, Cloud Infrastructure, Network Security to Ethical Hacking, learn everything with live projects, real tools, and expert mentorship.',
    buttonText: 'Start Learning',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=640&h=460&fit=crop',
  },
];

export default function HeroCarousel() {
  const slides = useMemo(() => slidesData, []);
  const [index, setIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  
  // Animation state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const mousePos = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  class Particle {
    baseX: number;
    baseY: number;
    x: number;
    y: number;
    radius: number;
    opacity: number;
    speed: number;
    constructor() {
      this.baseX = 0;
      this.baseY = 0;
      this.x = 0;
      this.y = 0;
      this.radius = 1;
      this.opacity = 1;
      this.speed = 0.1;
    }
    update(): void {}
    draw(): void {}
  }
  const particles = useRef<Particle[]>([]);

  // Handle canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: 520,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!canvas || dimensions.width === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const particleCount = 150;
    const mouseInfluence = 180;

    class ParticleImpl extends Particle {
      constructor() {
        super();
        this.baseX = Math.random() * dimensions.width;
        this.baseY = Math.random() * dimensions.height;
        this.x = this.baseX;
        this.y = this.baseY;
        this.radius = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.speed = Math.random() * 0.3 + 0.1;
      }
      update() {
        const dx = mousePos.current.x - this.x;
        const dy = mousePos.current.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouseInfluence) {
          const force = (mouseInfluence - distance) / mouseInfluence;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 5;
          this.y += Math.sin(angle) * force * 5;
        } else {
          this.x += (this.baseX - this.x) * 0.05;
          this.y += (this.baseY - this.y) * 0.05;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(227, 6, 19, ${this.opacity})`;
        ctx.fill();
      }
    }

    particles.current = [];
    for (let i = 0; i < particleCount; i++) {
      particles.current.push(new ParticleImpl());
    }

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Draw connections between nearby particles
      particles.current.forEach((p1, i) => {
        particles.current.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(227, 6, 19, ${0.15 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      particles.current.forEach((p) => {
        p.update();
        p.draw();
      });
      
      requestAnimationFrame(animate);
    };

    animate();
  }, [dimensions]);

  // Carousel auto-advance
  useEffect(() => {
    if (isHovering) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length, isHovering]);

  const go = (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length);

  const onPrimaryClick = () => {
    alert('Explore Courses clicked!');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const resetMouse = () => {
    mousePos.current = { x: -1000, y: -1000 };
  };

  return (
    <div className="bg-gradient-to-br from-white to-red-50 pb-5">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-full">
          {/* Slides with Canvas Background */}
          <div 
            className="relative overflow-hidden rounded-xl h-[520px]"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setIsHovering(false);
              resetMouse();
            }}
            onMouseMove={handleMouseMove}
          >
            {/* Canvas Background */}
            <canvas
              ref={canvasRef}
              width={dimensions.width}
              height={dimensions.height}
              className="absolute inset-0 pointer-events-none"
            />

            {slides.map((s, i) => (
              <div
                key={s.title}
                className={`grid md:grid-cols-2 gap-6 items-center transition-opacity duration-700 h-[520px] ${
                  i === index ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 pointer-events-none'
                }`}
              >
                {/* Left: Text */}
                <div className="px-8">
                  <h1 className="text-6xl font-mono sm:text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-4">
                    {s.title.split(' ').map((word, idx) => {
                      const clean = word.replace(/[.,]/g, '');
                      const highlight = ['AI', 'Cloud', 'Cyber', 'Learn', 'Lead', 'Tech', 'Skills'].includes(clean);
                      return (
                        <span key={idx} className={highlight ? 'font-bold text-red-700' : ''}>
                          {word}{' '}
                        </span>
                      );
                    })}
                  </h1>
                  <p className="text-md font-mono md:text-md text-gray-700 mb-8">{s.subtitle}</p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={onPrimaryClick}
                      className="px-12 py-3 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg font-semibold"
                    >
                      {s.buttonText}
                    </button>
                  </div>
                </div>

                {/* Right: Image */}
                <div className="flex items-center justify-center h-[520px] m-10">
                  <div className="rounded-xl overflow-hidden shadow-2xl">
                    <img
                      src={s.image}
                      alt="Hero visual"
                      className="object-cover"
                      style={{ width: 640, height: 460 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots - bottom center of hero wrapper */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 flex gap-3 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 w-2 rounded-full border transition-colors ${
                  i === index ? 'bg-red-600 border-red-600' : 'bg-gray-300 border-gray-300 hover:bg-red-400'
                }`}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
