import React from "react";
import { useNavigate } from "react-router-dom";
import Rooms from "../components/Rooms";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f6f4fa]">

      {/* HERO */}
      <div className="bg-gradient-to-r from-[#837ab6] to-[#cc8db3] text-white py-24 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold">
          Find Your Perfect Room
        </h1>

        <p className="mt-4 text-lg opacity-90">
          Search • Filter • Discover
        </p>

        {/* 🔥 SEARCH BUTTON */}
        <button
          onClick={() => navigate("/search")}
          className="mt-8 bg-white text-[#837ab6] px-8 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition"
        >
          🔍 Search Rooms
        </button>
      </div>



        <Rooms />


    </div>
  );
}