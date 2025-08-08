
'use client';

import { motion } from 'framer-motion';
import { Shield, Truck, Wrench, HeartHandshake } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Qualité Garantie',
    description: 'Matériel certifié de marques reconnues mondalement avec garantie constructeur complète.'
  },
  {
    icon: Truck,
    title: 'Livraison Rapide',
    description: 'Livraison dans toute la Tunisie sous 48h pour les produits en stock.'
  },
  {
    icon: Wrench,
    title: 'Service Après-Vente',
    description: 'Support technique 24/7 et service de maintenance par nos experts qualifiés.'
  },
  {
    icon: HeartHandshake,
    title: 'Conseil Personnalisé',
    description: 'Accompagnement sur mesure pour choisir le matériel adapté à vos besoins.'
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Pourquoi choisir MD Agricole ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Notre engagement envers l'excellence et la satisfaction client fait la différence
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
