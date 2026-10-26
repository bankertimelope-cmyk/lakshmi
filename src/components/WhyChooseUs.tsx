import React from 'react';
import { ShieldCheck, Dna, Lightbulb, TrendingUp } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-16 lg:py-24 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            03. Authentic Differentiators
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 text-balance">
            Why Commercial Growers & Farmers Choose Sri Lakshmi Mushrooms
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Mushroom farming demands precise hygiene, viable fungal genetics, and hands-on operational acumen. Here is what separates our Bhadravati agrobusiness center:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Dna className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Laboratory-Pure Spawns
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We propagate first-generation mother spawns inside HEPA-filtered laminar workstations, providing robust colonization and defense against trichoderma or competitor molds.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Practical Hands-on Inoculation
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Our training isn't classroom theory. Participants physically prepare substrates, operate autoclave boilers, mix spawns, and experience real chamber microclimate control.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Subsidy & DPR Guidance
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We guide new entrepreneurs through government horticulture subsidies (NHB, MIDH) and bank credit project feasibility reports for viable 500kg to 2-ton units.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Zero Chemical Residues
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every crop is grown using clean organic crop residues and monitored temperature-humidity cycles, yielding mushrooms of superior firmness, aroma, and shelf-life.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
