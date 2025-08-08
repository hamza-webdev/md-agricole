
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Votre message a été envoyé avec succès !');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        toast.error('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Téléphone',
      value: '+216 71 123 456',
      description: 'Lun-Ven: 8h00 - 18h00'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'contact@mdagricole.tn',
      description: 'Réponse sous 24h'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      value: 'Zone Industrielle Ariana',
      description: 'Tunis, Tunisie'
    },
    {
      icon: Clock,
      title: 'Horaires',
      value: '8h00 - 18h00',
      description: 'Du Lundi au Vendredi'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Contactez-nous
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Notre équipe est à votre disposition pour répondre à toutes vos questions 
          concernant notre matériel agricole et nos services.
        </p>
      </div>

      {/* Informations de contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {contactInfo.map((info, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 text-center h-full">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <info.icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {info.title}
              </h3>
              <p className="font-medium text-foreground mb-1">
                {info.value}
              </p>
              <p className="text-sm text-muted-foreground">
                {info.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Formulaire de contact */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Envoyez-nous un message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subject">Sujet *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Envoi en cours...'
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Envoyer le message
                  </>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Carte ou informations supplémentaires */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6 h-full">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Pourquoi nous choisir ?
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Expertise Reconnue
                </h3>
                <p className="text-muted-foreground">
                  Plus de 15 ans d'expérience dans la vente et la maintenance 
                  de matériel agricole en Tunisie.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Service Client Exceptionnel
                </h3>
                <p className="text-muted-foreground">
                  Notre équipe technique est disponible 24/7 pour vous accompagner 
                  dans vos projets agricoles.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Livraison Rapide
                </h3>
                <p className="text-muted-foreground">
                  Livraison gratuite dans toute la Tunisie sous 48h 
                  pour tous les produits en stock.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Garantie Constructeur
                </h3>
                <p className="text-muted-foreground">
                  Tous nos produits sont couverts par la garantie constructeur 
                  et notre service après-vente professionnel.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
