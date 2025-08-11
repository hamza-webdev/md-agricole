
'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Award, Package, Clock } from 'lucide-react';

const stats = [
  { 
    icon: Users, 
    number: 500, 
    suffix: '+', 
    label: 'Clients satisfaits', 
    color: 'text-green-600' 
  },
  { 
    icon: Award, 
    number: 15, 
    suffix: ' ans', 
    label: 'D\'expérience', 
    color: 'text-blue-600' 
  },
  { 
    icon: Package, 
    number: 200, 
    suffix: '+', 
    label: 'Produits en stock', 
    color: 'text-orange-600' 
  },
  { 
    icon: Clock, 
    number: 24, 
    suffix: 'h', 
    label: 'Support technique', 
    color: 'text-purple-600' 
  }
];

function CountUp({ end, suffix, duration = 2000 }: { end: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView && !isVisible) {
      setIsVisible(true);
      let startTime: number;
      const animate = (currentTime: number) => {
        if (startTime === undefined) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(end * easeOutCubic));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [inView, end, duration, isVisible]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function StatsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pourquoi nous faire confiance ?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Des années d'expérience au service des agriculteurs tunisiens
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full bg-background shadow-md ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                <CountUp end={stat.number} suffix={stat.suffix} />
              </div>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
