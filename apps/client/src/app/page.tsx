"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tokenManager } from "@/lib/api-client";
import {
  BookOpenIcon,
  StarIcon,
  UsersIcon,
  ChatCircleIcon,
  SparkleIcon,
  CaretRightIcon,
  TrendUpIcon,
  ListBulletsIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  CompassIcon,
  BooksIcon,
} from "@phosphor-icons/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { List as LucideList } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Fast client-side gate to avoid landing page flicker
  useEffect(() => {
    const token =
      tokenManager.getAccessToken() ||
      (typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null);

    if (token) {
      router.replace("/home");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return null;
  }
  // Book cover colors for visual variety
  const bookCovers = [
    { color: "bg-blue-700", top: "10%", left: "5%", rotation: "-12deg" },
    { color: "bg-orange-600", top: "15%", left: "75%", rotation: "8deg" },
    { color: "bg-red-700", top: "50%", left: "8%", rotation: "15deg" },
    { color: "bg-green-700", top: "55%", left: "80%", rotation: "-10deg" },
    { color: "bg-purple-700", top: "75%", left: "12%", rotation: "12deg" },
    { color: "bg-indigo-700", top: "70%", left: "82%", rotation: "-15deg" },
  ];

  return (
    <div className="min-h-screen bg-paper dark:bg-paper">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section - Using your design */}
      <section className="mb-10 px-4 sm:px-6 lg:px-8 pt-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-accent/10 to-accent-dark/10 dark:from-accent/20 dark:to-accent-dark/20 rounded-2xl overflow-hidden border border-border-subtle dark:border-border-subtle/20 p-6 md:p-8 lg:p-10 relative">
            {/* Floating Book Covers Background */}
            <div className="absolute inset-0 overflow-hidden opacity-10 dark:opacity-5">
              {bookCovers.map((book, idx) => (
                <div
                  key={idx}
                  className={`absolute w-16 h-24 md:w-20 md:h-32 ${book.color} rounded-lg shadow-lg`}
                  style={{
                    top: book.top,
                    left: book.left,
                    rotate: book.rotation,
                    animation: `float 6s ease-in-out ${idx * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>

            <div className="max-w-2xl relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <SparkleIcon className="w-6 h-6 text-accent dark:text-accent" />
                <span className="italic-serif text-accent dark:text-accent text-sm font-semibold uppercase tracking-wider">
                  Welcome to Recto
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-ink dark:text-ink mb-4">
                Discover Your Next Great Read
              </h1>
              <p className="text-lg text-ink-muted dark:text-ink-muted mb-8">
                Explore curated book recommendations, trending lists, and
                insights from passionate readers. Track your reading journey and
                connect with a vibrant community of book lovers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/home">
                  <Button className="bg-accent hover:bg-accent-dark dark:bg-accent dark:hover:bg-accent-dark text-white dark:text-black font-bold text-lg py-6 px-8 rounded-xl transition-all duration-300 shadow-lg">
                    Start Exploring
                    <CaretRightIcon className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    variant="outline"
                    className="font-semibold text-lg py-6 px-8 rounded-xl"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
        `}</style>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="italic-serif text-3xl md:text-4xl text-ink dark:text-ink mb-4">
              Why Choose Recto?
            </h2>
            <p className="text-ink-muted dark:text-ink-muted max-w-2xl mx-auto">
              Everything you need to track, discover, and share your love for
              books
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Track */}
            <Card className="bg-card dark:bg-card border-border-subtle dark:border-border-subtle hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <BookOpenIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-ink dark:text-ink">Track</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ink-muted dark:text-ink-muted text-sm">
                  Log every book you've read, mark your current reads, and keep
                  track of your reading progress throughout the year.
                </p>
              </CardContent>
            </Card>

            {/* Review */}
            <Card className="bg-card dark:bg-card border-border-subtle dark:border-border-subtle hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3">
                  <StarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-ink dark:text-ink">Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ink-muted dark:text-ink-muted text-sm">
                  Share your thoughts and ratings with the community. Write
                  detailed reviews and engage with other passionate readers.
                </p>
              </CardContent>
            </Card>

            {/* Discover */}
            <Card className="bg-card dark:bg-card border-border-subtle dark:border-border-subtle hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                  <CompassIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-ink dark:text-ink">
                  Discover
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ink-muted dark:text-ink-muted text-sm">
                  Explore genre-based recommendations, trending books, and
                  curated lists from readers with similar tastes.
                </p>
              </CardContent>
            </Card>

            {/* Connect */}
            <Card className="bg-card dark:bg-card border-border-subtle dark:border-border-subtle hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                  <UsersIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-ink dark:text-ink">
                  Connect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ink-muted dark:text-ink-muted text-sm">
                  Follow readers, join discussions, and build a community of
                  book lovers who share your passion for reading.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What is Recto Section */}
      <section
        id="about"
        className="bg-accent dark:bg-accent text-white dark:text-black py-20 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">
                What is Recto?
              </h2>
              <p className="text-white/90 dark:text-black/80 mb-4 leading-relaxed">
                Recto is a social platform built for book enthusiasts. Whether
                you're a casual reader or a bookworm, Recto helps you track what
                you're reading, discover your next favorite book, and connect
                with fellow readers who share your passion.
              </p>
              <p className="text-white/90 dark:text-black/80 leading-relaxed mb-8">
                From tracking your reading statistics to sharing detailed
                reviews and writing blogs, to curating personalized reading
                lists—Recto is your home for all things books.
              </p>

              <div className="space-y-6">
                <div className="flex items-starIcont gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/20 dark:bg-black/20 flex items-center justify-center flex-shrink-0">
                    <ChatCircleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-serif mb-1">
                      Social Reviews & Blogs
                    </h3>
                    <p className="text-white/80 dark:text-black/70 text-sm">
                      Engage with readers, share your opinions, and write
                      in-depth blog posts about your favorite books.
                    </p>
                  </div>
                </div>
                <div className="flex items-starIcont gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/20 dark:bg-black/20 flex items-center justify-center flex-shrink-0">
                    <TrendUpIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-serif mb-1">
                      Smart Tracking
                    </h3>
                    <p className="text-white/80 dark:text-black/70 text-sm">
                      Keep detailed stats on your reading habits and see your
                      progress over time.
                    </p>
                  </div>
                </div>
                <div className="flex items-starIcont gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/20 dark:bg-black/20 flex items-center justify-center flex-shrink-0">
                    <ListBulletsIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold font-serif mb-1">
                      Curated Lists
                    </h3>
                    <p className="text-white/80 dark:text-black/70 text-sm">
                      Create and share reading lists, discover trending
                      collections from the community.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Showcase */}
            <div className="flex justify-center">
              <div className="bg-white/10 dark:bg-black/10 backdrop-blur rounded-3xl p-6 shadow-2xl w-full max-w-sm border border-white/20 dark:border-black/20">
                <div className="bg-paper dark:bg-paper rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-br from-accent/20 to-accent-dark/20 aspect-video flex items-center justify-center">
                    <BooksIcon className="w-16 h-16 text-ink dark:text-ink opacity-50" />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-border-subtle dark:bg-border-subtle rounded w-3/4" />
                    <div className="h-4 bg-border-subtle dark:bg-border-subtle rounded w-1/2" />
                    <div className="flex gap-2 mt-4">
                      <div className="h-10 bg-border-subtle dark:bg-border-subtle rounded flex-1" />
                      <div className="h-10 bg-border-subtle dark:bg-border-subtle rounded flex-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="italic-serif text-3xl md:text-4xl text-ink dark:text-ink mb-4">
              Your Reading Dashboard
            </h2>
            <p className="text-ink-muted dark:text-ink-muted max-w-2xl mx-auto">
              Get insights into your reading habits with beautiful statistics
              and progress tracking
            </p>
          </div>

          <div className="bg-card dark:bg-card rounded-2xl shadow-2xl overflow-hidden border border-border-subtle dark:border-border-subtle">
            {/* Browser Chrome */}
            <div className="bg-border-subtle/30 dark:bg-border-subtle/10 border-b border-border-subtle dark:border-border-subtle px-6 py-4 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center text-sm text-ink-muted dark:text-ink-muted font-mono">
                dashboard.recto.app
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-8 md:p-12 bg-paper dark:bg-paper">
              <div className="space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Books Read", value: "24", icon: BookOpenIcon },
                    { label: "Pages Read", value: "6,847", icon: StarIcon },
                    { label: "Avg Rating", value: "4.2", icon: HeartIcon },
                    {
                      label: "Reading Streak",
                      value: "18d",
                      icon: TrendUpIcon,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-card dark:bg-card p-4 rounded-xl border border-border-subtle dark:border-border-subtle hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon className="w-4 h-4 text-accent dark:text-accent" />
                        <p className="text-xs text-ink-muted dark:text-ink-muted">
                          {stat.label}
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-ink dark:text-ink">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Books Grid */}
                <div>
                  <h3 className="text-lg font-semibold font-serif text-ink dark:text-ink mb-4">
                    Currently Reading
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      "bg-blue-700",
                      "bg-orange-600",
                      "bg-red-700",
                      "bg-green-700",
                      "bg-purple-700",
                    ].map((color, i) => (
                      <div
                        key={i}
                        className={`aspect-[3/4] rounded-lg shadow-md ${color} hover:scale-105 transition-transform cursor-pointer`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-paper dark:bg-paper">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="italic-serif text-3xl md:text-4xl text-ink dark:text-ink mb-4">
              What Readers Say
            </h2>
            <p className="text-ink-muted dark:text-ink-muted max-w-2xl mx-auto">
              Join thousands of book lovers who are already tracking their
              reading journey with Recto
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Avid Reader",
                quote:
                  "Recto transformed how I track my reading. I've read more books this year than ever before!",
                initials: "SC",
                color: "bg-blue-500",
              },
              {
                name: "James Wilson",
                role: "Book Critic",
                quote:
                  "The community here is amazing. I've discovered so many books through other readers' reviews.",
                initials: "JW",
                color: "bg-orange-500",
              },
              {
                name: "Emma Davis",
                role: "Student",
                quote:
                  "Love how easy it is to organize my reading lists. Recto is my new reading companion.",
                initials: "ED",
                color: "bg-purple-500",
              },
            ].map((testimonial) => (
              <Card
                key={testimonial.name}
                className="bg-card dark:bg-card border-border-subtle dark:border-border-subtle hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex gap-4 mb-4">
                    <div
                      className={`w-12 h-12 rounded-full ${testimonial.color} flex items-center justify-center text-white font-bold flex-shrink-0`}
                    >
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-ink dark:text-ink">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-ink-muted dark:text-ink-muted">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-ink-muted dark:text-ink-muted italic">
                    "{testimonial.quote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="italic-serif text-3xl md:text-4xl text-ink dark:text-ink mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-ink-muted dark:text-ink-muted">
              Everything you need to know about Recto
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem
              value="item-1"
              className="bg-card dark:bg-card border border-border-subtle dark:border-border-subtle rounded-lg"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline text-ink dark:text-ink">
                <span className="text-left">Is Recto free?</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-ink-muted dark:text-ink-muted">
                Yes! Recto is completely free to use. We believe everyone should
                have access to a platform for tracking and sharing their reading
                journey. We may introduce premium features in the future, but
                the core functionality will always be free.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-2"
              className="bg-card dark:bg-card border border-border-subtle dark:border-border-subtle rounded-lg"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline text-ink dark:text-ink">
                <span className="text-left">
                  Can I import data from Goodreads?
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-ink-muted dark:text-ink-muted">
                We're working on Goodreads integration! For now, you can
                manually add your books to Recto. Once you starIcont using
                Recto, you can export your data anytime to keep your reading
                history safe.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-3"
              className="bg-card dark:bg-card border border-border-subtle dark:border-border-subtle rounded-lg"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline text-ink dark:text-ink">
                <span className="text-left">Is there a mobile app?</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-ink-muted dark:text-ink-muted">
                Not yet, but it's on our roadmap! For now, Recto works great on
                mobile browsers and is fully responsive. You can add it to your
                home screen for a native-like experience.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-4"
              className="bg-card dark:bg-card border border-border-subtle dark:border-border-subtle rounded-lg"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline text-ink dark:text-ink">
                <span className="text-left">
                  How do I find book recommendations?
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-ink-muted dark:text-ink-muted">
                You can discover books through user reviews, reading lists
                curated by the community, and personalized recommendations based
                on your reading history. You can also follow other readers and
                see what they're currently reading.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-accent to-accent-dark dark:from-accent dark:to-accent-dark py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white dark:text-black">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">
            Ready to starIcont tracking your reading?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of readers who are already using Recto to discover
            their next favorite book.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white dark:bg-black text-black dark:text-white hover:bg-white/90 dark:hover:bg-black/90 font-semibold shadow-lg"
              >
                Get StarIconted Free
                <CaretRightIcon className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/home">
              <Button
                size="lg"
                variant="outline"
                className="border-white dark:border-black text-white dark:text-black hover:bg-white/10 dark:hover:bg-black/10"
              >
                Explore Books
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent dark:bg-accent text-white dark:text-black py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold font-serif flex items-center gap-2 mb-4 text-lg">
                <BookOpenIcon className="w-5 h-5" /> Recto
              </h3>
              <p className="text-sm opacity-80">
                A social platform for book lovers to track, review, and discover
                books.
              </p>
            </div>
            <div>
              <h4 className="font-semibold font-serif mb-4">Product</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>
                  <a
                    href="#features"
                    className="hover:opacity-100 transition-opacity"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="hover:opacity-100 transition-opacity"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="hover:opacity-100 transition-opacity"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold font-serif mb-4">Legal</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>
                  <a href="#" className="hover:opacity-100 transition-opacity">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-100 transition-opacity">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold font-serif mb-4">Follow Us</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>
                  <a href="#" className="hover:opacity-100 transition-opacity">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-100 transition-opacity">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 dark:border-black/20 pt-8 text-center text-sm opacity-80">
            <p>© 2026 Recto. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
