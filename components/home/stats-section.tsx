
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
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20'
  },
  {
    icon: Award,
    number: 15,
    suffix: ' ans',
    label: 'D\'expérience',
    color: 'text-agricultural-600',
    bgColor: 'bg-agricultural-500/10',
    borderColor: 'border-agricultural-500/20'
  },
  {
    icon: Package,
    number: 200,
    suffix: '+',
    label: 'Produits en stock',
    color: 'text-earth-600',
    bgColor: 'bg-earth-500/10',
    borderColor: 'border-earth-500/20'
  },
  {
    icon: Clock,
    number: 24,
    suffix: 'h',
    label: 'Support technique',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
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
    <section className="section-padding bg-gradient-to-br from-white via-primary/5 to-agricultural-50/50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Pourquoi nous faire <span className="text-gradient">confiance</span> ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Des années d'expérience au service des agriculteurs tunisiens avec un engagement
            constant pour la qualité et l'innovation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className={`card-modern p-8 text-center hover-lift border-2 ${stat.borderColor} ${stat.bgColor} transition-all duration-300 group-hover:shadow-strong`}>
                <div className="flex justify-center mb-6">
                  <div className={`p-4 rounded-2xl ${stat.bgColor} ${stat.color} shadow-medium group-hover:shadow-strong transition-all duration-300 group-hover:scale-110`}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
                <div className={`text-4xl lg:text-5xl font-bold ${stat.color} mb-3 group-hover:scale-105 transition-transform duration-300`}>
                  <CountUp end={stat.number} suffix={stat.suffix} />
                </div>
                <p className="text-muted-foreground font-semibold text-lg">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center mt-16"
        >
          <div className="flex items-center space-x-4">
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-agricultural-500 rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse-slow"></div>
            <div className="h-1 w-20 bg-gradient-to-r from-agricultural-500 to-earth-500 rounded-full"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
