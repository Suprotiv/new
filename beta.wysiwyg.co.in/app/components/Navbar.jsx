"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import Botton from "./Botton";

const LOGO_WHITE = "/images/Logo-Wysiwyg.png";
const LOGO_BLACK = "/images/Logo-Wysiwyg-B.png";
const LOGO_SIZE_EXPANDED = "h-12 md:h-14 2xl:h-[65px]";
const LOGO_SIZE_COMPACT = "h-9 md:h-10 2xl:h-[58px]";

const NAVBAR_HEIGHT_EXPANDED = "h-16 md:h-16 2xl:h-[90px]";
const NAVBAR_HEIGHT_COMPACT = "h-13 md:h-14 2xl:h-[78px]";
const NAVBAR_TEXT_EXPANDED = "text-lg md:text-sm 2xl:text-[20px]";
const NAVBAR_TEXT_COMPACT = "text-lg md:text-sm 2xl:text-[20px]";
const NAVBAR_GAP = "md:gap-8 2xl:gap-10";
const decodeSlug = (slug) => {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
};
const getNavbarClasses = ({
  isCompact,
  isCategoryRoute,
  isLightNavbarRoute,
  isProjectsRoute,
}) => {
  if (isCompact) {
    return isLightNavbarRoute
      ? {
          backgroundColor: "bg-[#fefdf8]",
          textColor: "text-black",
          lineBackground: "bg-black",
          logoSrc: LOGO_BLACK,
          logoSize: LOGO_SIZE_COMPACT,
          height: NAVBAR_HEIGHT_COMPACT,
          textSize: NAVBAR_TEXT_COMPACT,
          gap: NAVBAR_GAP,
        }
      : {
          backgroundColor: "bg-[#111010]",
          textColor: "text-[#fefdf8]",
          lineBackground: "bg-[#fefdf8]",
          logoSrc: LOGO_WHITE,
          logoSize: LOGO_SIZE_COMPACT,
          height: NAVBAR_HEIGHT_COMPACT,
          textSize: NAVBAR_TEXT_COMPACT,
          gap: NAVBAR_GAP,
        };
  }

  return {
    backgroundColor: isProjectsRoute
      ? "bg-[#111010]"
      : isLightNavbarRoute
        ? "bg-[#fefdf8]"
        : "bg-transparent",
    textColor: isCategoryRoute
      ? isProjectsRoute
        ? "text-[#fefdf8]"
        : "text-black "
      : "text-[#fefdf8]",
    lineBackground: isCategoryRoute ? "bg-black" : "bg-[#fefdf8]",
    logoSrc: isCategoryRoute
      ? isProjectsRoute
        ? LOGO_WHITE
        : LOGO_BLACK
      : LOGO_WHITE,
    logoSize: isProjectsRoute ? LOGO_SIZE_COMPACT : LOGO_SIZE_EXPANDED,
    height: isProjectsRoute ? NAVBAR_HEIGHT_COMPACT : NAVBAR_HEIGHT_EXPANDED,
    textSize: isProjectsRoute ? NAVBAR_TEXT_COMPACT : NAVBAR_TEXT_EXPANDED,
    gap: NAVBAR_GAP,
  };
};

const navbarClassesEqual = (first, second) => {
  return Object.keys(first).every((key) => first[key] === second[key]);
};

const SEARCH_PLACEHOLDER_PROMPTS = [
  "Logo",
  "Accessories",
  "Annuals Reports",
  "App",
  "Brochures",
  "Calendars",
  "Campaigns",
  "Catalogues",
  "Corporate Profiles",
  "Diaries",
  "Emailers",
  "Events",
  "Exhibitions",
  "Gifting",
  "Greetings",
  "Hoardings",
  "Invitations",
  "Kiosks",
  "Leaflets",
  "Menus",
  "Merchandise",
  "Newsletters",
  "Packaging",
  "POP",
  "Posters",
  "Presentations",
  "Print Ads",
  "Retail",
  "Signages",
  "Social Media",
  "Stationery",
  "User Manuals",
  "Wall Graphics",
  "Website",
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isCategoryRoute = [
    "/categories",
    "/about",
    "/contact",
    "/admin",
    "/jobs",
    "/search",
  ].some((route) => pathname.startsWith(route));

  const isLightNavbarRoute = ["/about", "/jobs"].some((route) =>
    pathname.startsWith(route)
  );

  const isProjectsRoute =
    pathname.startsWith("/projects/") && pathname.split("/").length > 2;

  const handleInputSearch = (input_term) => {
    if (input_term) {
      const query = input_term.toLowerCase().replace(/\s+/g, "-");
      router.push(`/search?q=${query}`);
    }
  };

  const [navbarClass, setNavbarClass] = useState(() =>
    getNavbarClasses({
      isCompact: isProjectsRoute,
      isCategoryRoute,
      isLightNavbarRoute,
      isProjectsRoute,
    })
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search for ");
  const [projectCategories, setProjectCategories] = useState([]);

  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const updateNavbarOnScroll = () => {
      const nextNavbarClass = getNavbarClasses({
        isCompact: menuOpen || window.scrollY >= 80,
        isCategoryRoute,
        isLightNavbarRoute,
        isProjectsRoute,
      });

      setNavbarClass((previousNavbarClass) => {
        if (navbarClassesEqual(previousNavbarClass, nextNavbarClass)) {
          return previousNavbarClass;
        }

        return nextNavbarClass;
      });
    };

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
        setShowSearch(false);
        setDropdownOpen(false);
      }
    };

    updateNavbarOnScroll();
    window.addEventListener("scroll", updateNavbarOnScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", updateNavbarOnScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen, isCategoryRoute, isProjectsRoute, isLightNavbarRoute]);

  useEffect(() => {
    let promptIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId;

    const typePlaceholder = () => {
      const prompt = SEARCH_PLACEHOLDER_PROMPTS[promptIndex];

      if (isDeleting) {
        charIndex -= 1;
      } else {
        charIndex += 1;
      }

      setSearchPlaceholder(`Search for ${prompt.slice(0, charIndex)}`);

      if (!isDeleting && charIndex === prompt.length) {
        isDeleting = true;
        timeoutId = setTimeout(typePlaceholder, 1200);
        return;
      }

      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        promptIndex = (promptIndex + 1) % SEARCH_PLACEHOLDER_PROMPTS.length;
        timeoutId = setTimeout(typePlaceholder, 350);
        return;
      }

      timeoutId = setTimeout(typePlaceholder, isDeleting ? 35 : 70);
    };

    typePlaceholder();

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const fetchProjectCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/categories`
        );
        const data = await res.json();
        setProjectCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch navbar categories:", error);
      }
    };

    fetchProjectCategories();
  }, []);

  const navItems = [
    {
      label: "Projects",
      subItems: projectCategories,
    },
    { label: "About" },
    { label: "Contact" },
    { label: "Jobs" },
  ];

  return (
    <nav
      className={`${navbarClass.backgroundColor} fixed w-full z-40 top-0 left-0 animate-fadeInTopToBottom transition-[height,background-color,box-shadow] duration-500 ease-in-out ${navbarClass.height}`}
    >
      <div className="max-w-[80vw] h-full flex flex-wrap items-start md:items-center justify-between mx-auto relative">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex h-full items-start self-start"
        >
          <img
            src={navbarClass.logoSrc}
            alt="Logo"
            className={`relative z-[60] block ${navbarClass.logoSize} w-auto object-contain object-top m-0 p-0 transition-[height,opacity] duration-500 ease-in-out`}
          />
        </Link>

        {/* Mobile Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
            setDropdownOpen(false);
          }}
          className={`inline-flex items-center z-50 py-2 text-sm ${navbarClass.textColor} rounded-lg md:hidden focus:outline-none`}
        >
          <div className="relative w-6 h-6">
            <svg
              className={`absolute top-0 left-0 w-6 h-6 transition-all ${
                menuOpen ? "opacity-100" : "opacity-0 -rotate-45"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <svg
              className={`absolute top-0 left-0 w-6 h-6 transition-all ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
        </button>

        {/* Menu */}
        <div
          ref={menuRef}
          className={`${
            menuOpen ? "fixed top-0 left-0 z-30 animate-slideDown" : "hidden"
          } w-full md:flex md:w-auto md:order-1 md:items-center
          `}
        >
          <ul
            className={`flex flex-col  py-4  md:py-0 rounded-b-xl relative z-30 ${navbarClass.backgroundColor} md:flex-row md:items-center ${navbarClass.gap} md:mt-0 md:font-medium md:bg-transparent`}
          >
            {navItems.map((item) =>
              item.label === "Projects" ? (
                <li
                  key="projects"
                  className={`relative flex items-center ${navbarClass.textSize} font-medium cursor-pointer text-center ${navbarClass.textColor}`}
                >
                  <div
                    className="relative z-10 inline-block group/projects"
                    onClick={(e) => {
                      e.preventDefault();
                      setDropdownOpen(!dropdownOpen);
                    }}
                  >
                    Projects
                    <span
                      className={`absolute left-0 -bottom-1 w-0 h-[1.4px] ${navbarClass.lineBackground} transition-all duration-300 ease-in-out group-hover/projects:w-full`}
                      aria-hidden="true"
                    />
                  </div>

                  <ul
                    className={`fixed inset-x-0 top-16 md:top-14 2xl:top-[72px] z-50 grid w-full grid-cols-2 gap-x-16 gap-y-6 rounded-none bg-[#fefdf8] px-[10vw] py-10 text-left animate-fadeInMedium sm:grid-cols-3 md:grid-cols-[repeat(4,max-content)] md:justify-between ${
                      dropdownOpen ? "grid" : "hidden"
                    }`}
                  >
                    {item.subItems.map((sub) => (
                      <li
                        key={sub.slug}
                        className="justify-self-start text-left"
                      >
                        <Link
                          href={`/categories/${decodeSlug(sub.slug)}`}
                          className="group/sub relative inline-flex justify-start text-left text-xs md:text-sm font-medium uppercase tracking-wide text-[#72814b] transition-colors duration-300 hover:font-bold hover:text-black"
                          onClick={() => {
                            setMenuOpen(false);
                            setDropdownOpen(false);
                          }}
                        >
                          <span className="relative z-10 leading-none">
                            {sub.name}
                          </span>
                          <span
                            className="absolute left-0 -bottom-1 w-0 h-[1.4px] bg-[#72814b] transition-all duration-300 ease-in-out group-hover/sub:w-full group-hover/sub:bg-black"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li
                  key={item.label.toLowerCase()}
                  className={`group relative flex items-center ${navbarClass.textSize} font-medium cursor-pointer text-center ${navbarClass.textColor}`}
                >
                  <Link
                    href={`/${item.label.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="relative z-10"
                  >
                    {item.label}
                  </Link>
                  <span
                    className={`absolute left-0 -bottom-1 w-0 h-[1.4px] ${navbarClass.lineBackground} transition-all duration-300 ease-in-out group-hover:w-full`}
                    aria-hidden="true"
                  ></span>
                </li>
              )
            )}

            {/* Desktop Search */}
            <div
              className="hidden md:flex items-center gap-2 ml-auto relative"
              ref={searchRef}
            >
              <button
                onClick={() => setShowSearch((prev) => !prev)}
                className={`${navbarClass.textColor} ${navbarClass.textSize} rounded cursor-pointer`}
              >
                <FaSearch />
              </button>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleInputSearch(e.target.value);
                  }
                }}
                className={`absolute right-0 top-full mt-2 w-64 px-4 py-2 rounded-md bg-[#fefdf8] text-[#111010] placeholder-[#111010] border border-[#272727] focus:outline-none focus:ring focus:ring-[#444] transition-all duration-300 transform ${
                  showSearch
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              />
            </div>

            {/* Mobile Search */}
            <li className="md:hidden mt-3">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-[#111010] text-[#f6f5ec] placeholder-[#888] border border-[#272727] focus:outline-none focus:ring focus:ring-[#444] transition-all"
              />
            </li>
          </ul>
        </div>
      </div>

      {/* Background blur */}
      {(menuOpen || dropdownOpen) && (
        <div className="fixed inset-0 backdrop-blur-md z-0 animate-fadeInMedium transition-opacity duration-300"></div>
      )}
    </nav>
  );
};

export default Navbar;
