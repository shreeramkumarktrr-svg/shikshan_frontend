import { useEffect, useRef, useState } from 'react';

const InteractiveParticles = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        // Set canvas size
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle class
        class Particle {
            constructor(x, y) {
                this.originalX = x;
                this.originalY = y;
                this.x = x;
                this.y = y;
                this.vx = 0;
                this.vy = 0;
                this.radius = Math.random() * 5 + 2;
                this.originalRadius = this.radius;
                this.opacity = Math.random() * 0.7 + 0.3;
                this.color = this.getRandomColor();
                this.returnSpeed = 0.04 + Math.random() * 0.02;
                this.repelDistance = 100 + Math.random() * 40;
                this.repelForce = 0.6 + Math.random() * 0.4;
                this.pulseSpeed = 0.02 + Math.random() * 0.02;
                this.pulseOffset = Math.random() * Math.PI * 2;
            }

            getRandomColor() {
                const colors = [
                    'rgba(59, 130, 246, ', // blue
                    'rgba(107, 114, 128, ', // gray
                    'rgba(75, 85, 99, ',    // darker gray
                    'rgba(156, 163, 175, ', // lighter gray
                    'rgba(31, 41, 55, ',    // very dark gray
                ];
                return colors[Math.floor(Math.random() * colors.length)];
            }

            update(mouseX, mouseY, isMouseOver) {
                let isBeingRepelled = false;

                if (isMouseOver) {
                    const dx = this.x - mouseX;
                    const dy = this.y - mouseY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < this.repelDistance) {
                        const force = (this.repelDistance - distance) / this.repelDistance;
                        const angle = Math.atan2(dy, dx);
                        this.vx += Math.cos(angle) * force * this.repelForce;
                        this.vy += Math.sin(angle) * force * this.repelForce;

                        // Scale up when being repelled
                        this.radius = this.originalRadius * (1 + force * 0.3);
                        isBeingRepelled = true;
                    }
                }

                // Return to original position
                const returnX = (this.originalX - this.x) * this.returnSpeed;
                const returnY = (this.originalY - this.y) * this.returnSpeed;
                this.vx += returnX;
                this.vy += returnY;

                // Apply friction
                this.vx *= 0.95;
                this.vy *= 0.95;

                // Update position
                this.x += this.vx;
                this.y += this.vy;

                // Only apply pulsing animation when not being repelled
                if (!isBeingRepelled) {
                    this.pulseOffset += this.pulseSpeed;
                    const pulse = Math.sin(this.pulseOffset) * 0.08 + 1;
                    this.radius = this.originalRadius * pulse;
                }
            }

            draw(ctx) {
                ctx.save();

                // Create 3D effect with gradient
                const gradient = ctx.createRadialGradient(
                    this.x - this.radius * 0.3,
                    this.y - this.radius * 0.3,
                    0,
                    this.x,
                    this.y,
                    this.radius
                );

                gradient.addColorStop(0, this.color + (this.opacity + 0.3) + ')');
                gradient.addColorStop(0.7, this.color + this.opacity + ')');
                gradient.addColorStop(1, this.color + (this.opacity * 0.3) + ')');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();

                // Add subtle shadow for 3D effect
                ctx.shadowColor = this.color + '0.2)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;

                ctx.restore();
            }
        }

        // Initialize particles in a circular formation
        const initParticles = () => {
            particlesRef.current = [];
            const centerX = canvas.width / (2 * window.devicePixelRatio);
            const centerY = canvas.height / (2 * window.devicePixelRatio);
            const maxRadius = Math.min(centerX, centerY) * 0.85;

            // Create concentric circles of particles with varying density
            for (let ring = 0; ring < 10; ring++) {
                const ringRadius = (ring + 1) * (maxRadius / 10);
                const particlesInRing = Math.floor(ring * 6 + 8);

                for (let i = 0; i < particlesInRing; i++) {
                    const angle = (i / particlesInRing) * Math.PI * 2;
                    const x = centerX + Math.cos(angle) * ringRadius;
                    const y = centerY + Math.sin(angle) * ringRadius;

                    // Add organic randomness
                    const randomOffset = 20 + ring * 2;
                    const finalX = x + (Math.random() - 0.5) * randomOffset;
                    const finalY = y + (Math.random() - 0.5) * randomOffset;

                    particlesRef.current.push(new Particle(finalX, finalY));
                }
            }

            // Add some random particles in the center for density
            for (let i = 0; i < 15; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * (maxRadius * 0.3);
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                particlesRef.current.push(new Particle(x, y));
            }
        };

        initParticles();

        // Mouse event handlers
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        };

        const handleMouseEnter = () => {
            setIsHovering(true);
        };

        const handleMouseLeave = () => {
            setIsHovering(false);
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseenter', handleMouseEnter);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

            particlesRef.current.forEach(particle => {
                particle.update(mouseRef.current.x, mouseRef.current.y, isHovering);
                particle.draw(ctx);
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseenter', handleMouseEnter);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isHovering]);

    return (
        <div className="relative w-full h-full">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-gray-50/30 rounded-3xl"></div>

            <canvas
                ref={canvasRef}
                className="relative w-full h-full cursor-pointer transition-all duration-300 hover:scale-105"
                style={{
                    width: '100%',
                    height: '100%',
                    background: 'transparent'
                }}
            />

            {/* Decorative corner elements */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-blue-300 rounded-full opacity-40 animate-pulse"></div>
            <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-gray-300 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-4 left-4 w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-4 right-4 w-2.5 h-2.5 bg-gray-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
    );
};

export default InteractiveParticles;