"use client";
import React, { useEffect, useState } from "react";
import Buttons from "./Buttons";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const GallarySection = ({ project }) => {
  const API_URL = "https://api.rounak.co";
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tempImages, setTempImages] = useState([]);
  const [loading, setLoading] = useState(true); // New loading state

  const itemsPerPage = 6;

  useEffect(() => {
    const getData = async () => {
      setLoading(true); // Set loading to true before fetching data
      try {
        const response = await axios.get(
          `${API_URL}/api/portfolio/getprojects`
        );
        setPortfolioItems(response.data);
        setLoading(false); // Data fetched, set loading to false
      } catch (err) {
        console.log(err);
        setLoading(false); // Ensure loading is stopped even if an error occurs
      }
    };
    getData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setTempImages([]); // Clear temporary images
    const timer = setTimeout(() => {
      setTempImages(filteredItems.slice(0, itemsPerPage));
    }, 10); // Add delay for smooth transition
    return () => clearTimeout(timer);
  }, [selectedCategory, portfolioItems]);

  const categories = [
    "All",
    "SMC",
    "Catalogue",
    "Advertisements",
    "Caption",
    "Anime",
  ];

  const filteredItems =
    selectedCategory === "All"
      ? portfolioItems
      : portfolioItems.filter((item) => item.type === selectedCategory);

  const handleThumbnailClick = (videoUrl) => {
    setCurrentVideo(videoUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVideo(null);
  };

  const handleLoadMore = () => {
    setCurrentPage((prevPage) => prevPage + 1);
    setTempImages(filteredItems.slice(0, (currentPage + 1) * itemsPerPage));
  };

  return (
    <div className="text-white pb-12 px-4 md:px-12 w-full lg:px-16">
      {loading ? ( // Show loading spinner or animation
        <div className="flex justify-center items-center h-screen">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-300 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="flex w-full overflow-x-auto space-x-2 mb-8 md:space-x-8 md:mb-12 animate-fadeIn scrollbar-hide">
            <div className="flex flex-nowrap justify-center space-x-2 md:space-x-5 mx-auto">
              {categories.map((category) => (
                <div
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="mb-4 md:mb-0"
                >
                  <Buttons
                    text={category === "SMC" ? "Social Media" : category} // Change text if category is 'smc'
                    size="sm"
                    isSelected={selectedCategory === category}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-10 animate-fadeIn transition-all duration-300">
            {Array.from({ length: project.image_no }).map((_, index) => (
              <div
                key={index}
                className="relative blur-load group overflow-hidden rounded-lg animate-popIn transition-all duration-300 hover:cursor-pointer"
                onClick={() => handleThumbnailClick(item.video)}
              >
                <div className="h-full w-full inner-div">
                  <img
                    src={`/images/${project_id}/image${index + 1}.jpg`}
                    alt={project.title}
                    className="w-full h-[40vh] sm:h-[40vh] md:h-[35vh] lg:h-[30vh] object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center px-4">
                    <h2 className="text-lg font-semibold">{project.title}</h2>
                    <p className="text-sm">{project.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tempImages.length < filteredItems.length && (
            <div className="flex justify-center mt-8 animate-fadeIn">
              <button
                onClick={handleLoadMore}
                className="relative group text-white font-bold py-2 px-3 border-none bg-transparent tracking-wide transition-all duration-500"
              >
                Load More
                <span className="absolute top-0 left-0 w-0 h-[1px] bg-[#1fd1ff] transition-all duration-500 group-hover:w-full"></span>
                <span className="absolute top-0 left-0 w-[1px] h-0 bg-[#1fd1ff] transition-all duration-500 group-hover:h-full"></span>
                <span className="absolute bottom-0 right-0 w-0 h-[1px] bg-[#1fd1ff] transition-all duration-500 group-hover:w-full"></span>
                <span className="absolute bottom-0 right-0 w-[1px] h-0 bg-[#1fd1ff] transition-all duration-500 group-hover:h-full"></span>
              </button>
            </div>
          )}

          {isModalOpen && currentVideo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 sm:p-8">
              <div className="relative w-full max-w-lg sm:max-w-xl lg:max-w-4xl p-4 sm:p-6 bg-black rounded-lg">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition"
                >
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
                <iframe
                  className="w-full h-[250px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-lg"
                  src={currentVideo}
                  title="Video Player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GallarySection;
