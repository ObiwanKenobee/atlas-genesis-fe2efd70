import { motion } from "framer-motion";
import { 
  Shield, 
  Repeat, 
  Database, 
  BookOpen, 
  TrendingUp,
  ChevronRight
} from "lucide-react";

const layers = [
  {
    number: "01",
    title: "Infinite Purpose & Ethical Governance",
    description: "Decentralized AI-driven decision-making grounded in universal ethics, ensuring transparent governance through DAO participation.",
    icon: Shield,
    color: "from-primary to-ocean",
    features: ["Moral AI Protocols", "DAO Governance", "Values Engine"]
  },
  {
    number: "02",
    title: "Regenerative Value Exchange",
    description: "Seamless exchange of regenerative assets including carbon credits, ecosystem restoration credits, and cultural preservation funds.",
    icon: Repeat,
    color: "from-ocean to-earth",
    features: ["Blockchain Records", "AI-Powered Oracles", "Living Smart Contracts"]
  },
  {
    number: "03",
    title: "Data Integration & Metrics Engine",
    description: "Measure real-world regenerative impact across agriculture, oceanic, healthcare, and circular economy sectors.",
    icon: Database,
    color: "from-earth to-accent",
    features: ["Big Data Analytics", "AI Forecasting", "Ecosystem Mapping"]
  },
  {
    number: "04",
    title: "Cultural & Knowledge Impact",
    description: "Build and share a global knowledge ecosystem through impact stories, collaboration, and ethical AI research.",
    icon: BookOpen,
    color: "from-accent to-sunset",
    features: ["Impact Stories", "Global Hub", "AI Library"]
  },
  {
    number: "05",
    title: "Global Impact Economy",
    description: "Enable financial flows supporting regenerative businesses through impact investing, DeFi, and microfinance.",
    icon: TrendingUp,
    color: "from-sunset to-primary",
    features: ["Impact Marketplace", "Sustainable Finance", "Microfinance Platform"]
  }
];

const PlatformLayers = () => {
  return (
    <section id="layers" className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <span className="text-primary font-medium tracking-wider uppercase text-xs sm:text-sm">
            Platform Architecture
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mt-3 sm:mt-4 mb-4 sm:mb-6">
            Five Layers of{" "}
            <span className="text-gradient">Regeneration</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4 sm:px-0">
            A multi-layered ecosystem designed to preserve humanity and the planet,
            blending impact finance with ethical technology.
          </p>
        </motion.div>

        {/* Layers Grid */}
        <div className="space-y-6">
          {layers.map((layer, index) => (
            <motion.div
              key={layer.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative bg-card-gradient border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-500 hover:shadow-glow overflow-hidden">
                {/* Gradient Line */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${layer.color} opacity-50 group-hover:opacity-100 transition-opacity`}
                />
                
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Number & Icon */}
                  <div className="flex items-center gap-6 lg:w-48">
                    <span className="text-5xl font-display font-bold text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors">
                      {layer.number}
                    </span>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${layer.color} flex items-center justify-center shadow-lg`}>
                      <layer.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {layer.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {layer.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {layer.features.map((feature) => (
                        <span 
                          key={feature}
                          className="px-3 py-1 rounded-full bg-muted/50 text-sm text-muted-foreground border border-border/50"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden lg:flex items-center">
                    <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformLayers;
