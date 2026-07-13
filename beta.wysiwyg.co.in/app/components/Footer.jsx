"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaVimeoV } from "react-icons/fa";

const decodeSlug = (slug) => {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
};

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/categories`
        );
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch footer categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const footerLinks = [
    { label: "About us", href: "/about" },
    ...categories
      .filter((category) => category?.name && category?.slug)
      .map((category) => ({
        label: category.name,
        href: `/categories/${decodeSlug(category.slug)}`,
      })),
  ];

  return (
    <div className="relative h-auto z-0 bg-[#111010]">
      <div className="mt-[-100vh] h-[190vh] md:h-[145vh] 2xl:h-[135vh] sticky bottom-0  max-w-[80vw] mx-auto">
        {/* Background image */}
       

        {/* Overlay */}
        <div className="absolute bottom-0 w-full text-white bg-opacity-60 bg-[#111010] z-10">
          <div className="mx-auto py-10">
            {/* Top section: Links + Socials */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-start gap-10">
              {/* Link groups */}
              <div className="columns-2 gap-x-18 md:columns-3 text-[11px] md:text-xs font-semibold tracking-wide uppercase">
                {footerLinks.map((link) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className="mb-2 block break-inside-avoid transition-colors hover:text-white/70"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Social icons */}
              <div className="flex md:justify-center gap-3 pt-2 md:pt-0">
                {[
                  { label: "LinkedIn", Icon: FaLinkedinIn, href: "https://www.linkedin.com/company/wysiwyg-communications-pvt-ltd./" },
                  { label: "Facebook", Icon: FaFacebookF, href: "https://www.facebook.com/wysiwygcommunications/" },
                  { label: "Instagram", Icon: FaInstagram, href: "https://www.instagram.com/wysiwygcommunications/" },
                  { label: "Vimeo", Icon: FaVimeoV, href: "#" },
                ].map(({ label, Icon, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="pointer-events-auto w-9 h-9 rounded-full border border-white/25 flex items-center justify-center hover:border-white/60 transition"
                  >
                    <Icon className="text-white text-sm" />
                  </a>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#707070] my-10"></div>

            {/* Bottom section: logo + links + icons */}

            {/* Footer note */}
            <div className="text-center mt-10 text-xs md:text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Wysiwyg Communications . All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
