import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { Building2, TrendingUp, Users, Target } from 'lucide-react';

export const StrategistView: React.FC = () => {
  const experiences = [
    {
      company: "Cardiweb",
      role: "Head of Product Management",
      period: "Juil 2023 - Présent",
      desc: "Management de l'équipe Product (PM, PO, Designers) et structuration des pratiques Discovery & Delivery. Accompagnement des clients grands comptes dans la définition de leur stratégie produit. Référent sur les sujets transverses complexes (Scaling, GenAI).",
      tags: ["Leadership", "Discovery & Delivery", "Stratégie", "Management"]
    },
    {
      company: "Cardiweb",
      role: "Lead Product Manager",
      period: "Sept 2022 - Juil 2023",
      desc: "Co-création de produits digitaux sur-mesure avec une forte exigence UX et technique. Leadership en avant-vente et gestion de la relation client.",
      tags: ["Avant-vente", "UX/UI", "Cadrage"]
    },
    {
      company: "Haulogy",
      role: "Product Manager",
      period: "Sept 2018 - Jan 2021",
      desc: "Responsable des opérations IT France pour un éditeur SaaS énergie. Pilotage du déploiement agile, adaptation des solutions au marché français et gestion des clients (gaz et électricité).",
      tags: ["SaaS", "Énergie", "Agile", "Opérations IT"]
    },
    {
      company: "Consultant IT",
      role: "Product Manager / AMOA",
      period: "2015 - 2018",
      desc: "Mission chez Enedis : Pilotage de projets SI liés à la distribution d'électricité et aux compteurs intelligents. Coordination MOA/MOE, recette et conduite du changement.",
      tags: ["SI Complexes", "Utilities", "Pilotage"]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      {/* Competencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
          <Target className="text-blue-600 mb-4 h-8 w-8" />
          <h3 className="font-bold text-lg mb-2 text-slate-900">Stratégie Produit</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Alignement de la vision produit avec les enjeux business. Capacité à naviguer le paysage technologique pour créer des produits à fort impact.
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
          <Users className="text-blue-600 mb-4 h-8 w-8" />
          <h3 className="font-bold text-lg mb-2 text-slate-900">Leadership & Ops</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Culture User-First et rigueur opérationnelle. Structuration des équipes pour passer efficacement du POC à la production.
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-blue-100 transition-colors">
          <TrendingUp className="text-blue-600 mb-4 h-8 w-8" />
          <h3 className="font-bold text-lg mb-2 text-slate-900">Hybridité Tech/Produit</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Capacité à démystifier la tech (GenAI, APIs) pour embarquer équipes et clients. Intégration intelligente de la data et de l'IA.
          </p>
        </div>
      </div>

      {/* Track Record Timeline */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="text-slate-400" />
          Parcours
        </h2>
        
        {/* Timeline Container - Reverted to solid grey line */}
        <div className="relative border-l-2 border-slate-200 ml-3 space-y-10 pb-4">
          {experiences.map((exp, index) => (
            <div key={index} className="ml-8 relative">
              
              {/* Timeline Dot - Perfectly centered on the line (-left-[41px] aligns w-5 center to 2px border center) */}
              <div className="absolute -left-[41px] top-6 flex items-center justify-center h-5 w-5">
                 {/* Pulse/Ping animation for current role */}
                 {index === 0 && (
                     <span className="absolute h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                 )}
                 {/* The actual dot */}
                 <span className={`relative h-5 w-5 rounded-full border-4 shadow-sm z-10 ${index === 0 ? 'bg-blue-600 border-white ring-2 ring-blue-100' : 'bg-slate-300 border-white'}`} />
              </div>

              {/* Card - With Idle Animation for current role */}
              <motion.div 
                className={`p-6 rounded-lg border transition-all relative bg-white ${
                    index === 0 
                    ? 'border-blue-200 shadow-sm' 
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}
                animate={index === 0 ? {
                    boxShadow: ['0 1px 2px 0 rgba(0, 0, 0, 0.05)', '0 4px 12px -2px rgba(59, 130, 246, 0.15)', '0 1px 2px 0 rgba(0, 0, 0, 0.05)'],
                    borderColor: ['#bfdbfe', '#60a5fa', '#bfdbfe']
                } : {}}
                transition={index === 0 ? {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                } : {}}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{exp.role}</h3>
                    <p className="text-slate-500 font-medium">{exp.company}</p>
                  </div>
                  <span className={`text-xs font-mono px-2 py-1 rounded mt-2 md:mt-0 inline-block border ${
                      index === 0 ? 'text-blue-700 bg-blue-50 border-blue-100' : 'text-slate-500 bg-slate-100 border-slate-200'
                  }`}>
                    {exp.period}
                  </span>
                </div>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">{exp.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {exp.tags.map(tag => (
                    <Badge key={tag} mode="strategist">{tag}</Badge>
                  ))}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};