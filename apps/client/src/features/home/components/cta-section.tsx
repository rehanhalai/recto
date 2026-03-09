import { Button } from "@/components/ui/button";

export const CTASection = () => (
  <section className="mb-20">
    <div className="bg-linear-to-r from-accent to-accent-dark dark:from-accent dark:to-accent-dark rounded-3xl overflow-hidden p-8 md:p-12 lg:p-16 text-white">
      <div className="max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Join Our Reading Community
        </h2>
        <p className="text-lg opacity-90 mb-8">
          Create your personalized lists, share book reviews, and discover what
          other readers love.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            className="bg-white hover:bg-white/90 text-accent font-bold text-base py-6 px-8 rounded-xl transition-all duration-300 shadow-lg"
            size="lg"
          >
            Sign Up Today
          </Button>
          <Button
            className="bg-white/20 hover:bg-white/30 text-white font-bold text-base py-6 px-8 rounded-xl transition-all duration-300 border border-white"
            size="lg"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  </section>
);
