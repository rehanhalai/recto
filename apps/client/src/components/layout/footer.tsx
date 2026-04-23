"use client";

import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui";
import {
  EnvelopeIcon,
  LinkedinLogoIcon,
  TwitterLogoIcon,
  GithubLogoIcon,
} from "@phosphor-icons/react";

import rectoLogoLight from "@recto/assets/logos/recto-logo-light.webp";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Security", href: "#" },
      { label: "Blog", href: "#" },
    ],
    Company: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
    ],
    Resources: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Community", href: "#" },
      { label: "Support", href: "#" },
    ],
    Legal: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "License", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: TwitterLogoIcon, href: "#", label: "Twitter" },
    { icon: LinkedinLogoIcon, href: "#", label: "LinkedIn" },
    {
      icon: GithubLogoIcon,
      href: "https://github.com/rehanhalai/recto",
      label: "GitHub",
    },
    { icon: EnvelopeIcon, href: "mailto:recto.help@gmail.com", label: "Email" },
  ];

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Main Footer Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Section - Full width on mobile, normal on larger screens */}
          <div className="col-span-2 sm:col-span-1 md:col-span-1">
            <div className="mb-4">
              <Image
                src={rectoLogoLight}
                alt="Recto Logo"
                loading="eager"
                width={120}
                height={50}
                style={{ width: "120px", height: "auto" }}
              />
              <p className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary-dark mt-2 line-clamp-2">
                Your digital book companion
              </p>
            </div>
            {/* Social Links */}
            <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="p-1.5 sm:p-2 rounded-full hover:bg-border-subtle dark:hover:bg-border-white transition-colors text-text-secondary dark:text-text-secondary-dark hover:text-ink dark:hover:text-ink-light"
                  >
                    <Icon size={20} weight="fill" className="sm:w-6 sm:h-6" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Links Grid - Responsive */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="col-span-1">
              <h3 className="text-xs sm:text-sm font-semibold text-ink dark:text-ink-light mb-3 sm:mb-4 uppercase tracking-wider">
                {section}
              </h3>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary-dark hover:text-ink dark:hover:text-ink-light transition-colors line-clamp-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <Separator className="my-6 sm:my-8 bg-border-subtle dark:bg-border-white" />

        {/* Bottom Section - Fully Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
          {/* Copyright - Mobile optimized */}
          <p className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary-dark order-2 sm:order-1">
            © {currentYear} Recto
          </p>

          {/* Legal Links - Stack on mobile, inline on desktop */}
          <div className="flex flex-wrap gap-3 sm:gap-6 order-1 sm:order-2 w-full sm:w-auto">
            <Link
              href="#"
              className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary-dark hover:text-ink dark:hover:text-ink-light transition-colors whitespace-nowrap"
            >
              Privacy
            </Link>
            <span className="text-border-subtle dark:text-border-white hidden sm:inline">
              •
            </span>
            <Link
              href="#"
              className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary-dark hover:text-ink dark:hover:text-ink-light transition-colors whitespace-nowrap"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
