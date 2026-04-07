import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter, FaHome, FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#837ab6] text-white mt-20">
      
      {/* ================= TOP SECTION ================= */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10">

        {/* Logo + Description */}
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaHome /> RoomRent
          </h2>
          <p className="mt-4 text-white/80 text-sm leading-relaxed">
            Find your perfect room easily.
            Browse, filter and connect with owners in one place.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <div className="flex flex-col gap-2 text-white/80">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/rooms" className="hover:text-white transition">Rooms</Link>
            <Link to="/search" className="hover:text-white transition">Search</Link>
          </div>
        </div>

        {/* Contact & Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>

          {/* Contact Number */}
          <div className="flex items-center gap-3 text-white/80 mb-6 hover:text-white transition">
            <FaPhoneAlt className="text-xl" />
            <a href="tel:+9779821696631" className="text-sm font-medium tracking-wide">
              +977 9821696631
            </a>
          </div>

          <div className="flex gap-4 text-2xl">
            {/* Facebook */}
            <a href="https://www.facebook.com/share/1FVi4mNina/" target="_blank" rel="noreferrer" className="hover:text-[#cc8db3] transition">
              <FaFacebook />
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/9779821696631" target="_blank" rel="noreferrer" className="hover:text-[#25D366] transition">
              <FaWhatsapp />
            </a>

            <a href="#" className="hover:text-[#cc8db3] transition">
              <FaInstagram />
            </a>

            <a href="#" className="hover:text-[#cc8db3] transition">
              <FaTwitter />
            </a>
          </div>

          <p className="mt-4 text-sm text-white/80">
            Stay connected for new room updates.
          </p>
        </div>

      </div>

      {/* ================= BOTTOM SECTION ================= */}
      <div className="border-t border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-white/80">
          © {new Date().getFullYear()} RoomRent. All Rights Reserved.
        </div>
      </div>

    </footer>
  );
}