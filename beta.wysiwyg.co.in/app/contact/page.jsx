"use client";
import ReCAPTCHA from "react-google-recaptcha";
import React, { useState } from "react";
import axios from "axios";
import EditableText from "../components/EditableText";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const [captchaToken, setCaptchaToken] = useState("");

  const handleCaptcha = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaToken) {
      alert("Please complete the CAPTCHA.");
      return;
    }

    setStatus("loading");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/contact`,
        { ...formData, captcha: captchaToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        setStatus("success");
        setFormData({
          name: "",
          phone: "",
          email: "",
          subject: "",
          message: "",
        });
        setCaptchaToken(""); // Reset CAPTCHA
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setStatus("error");
    }
  };

  return (
    <div className="bg-[#fefdf8] py-20 relative z-10">
      <div className="mt-[5vh] text-black w-[80vw] mx-auto grid grid-cols-1 items-stretch gap-12 md:grid-cols-2">
        {/* Left Column */}
        <div className="flex h-full flex-col animate-fadeIn">
          <h2 className="text-lg leading-tight">
            <EditableText keyName="contact.name" fallback="Nidhi Harlalka" />
          </h2>
          <h1 className="text-2xl font-bold uppercase leading-tight">
            <EditableText
              keyName="contact.company"
              fallback="WYSIWYG Communications Private Limited"
            />
          </h1>
          <div className="mt-4 leading-tight">
            <EditableText
              as="p"
              keyName="contact.address"
              fallback={`28, Pankaj Mullick Sarani,\nBallygunge, Kolkata,\nWest Bengal 700019, India`}
              multiline
            />
          </div>
          <p className="mt-6 leading-tight">
            <strong>P.</strong>{" "}
            <EditableText keyName="contact.phone" fallback="(+91) 33 22802154" />
          </p>
          <p className="leading-tight">
            <strong>E.</strong>{" "}
            <a
              href="mailto:business@wysiwyg.co.in"
              className="text-[#5a6b3e] underline"
            >
              <EditableText
                keyName="contact.email"
                fallback="business@wysiwyg.co.in"
              />
            </a>
          </p>
          <p className="mb-6 leading-tight">
            <strong>H.</strong>{" "}
            <EditableText
              keyName="contact.hours"
              fallback="Monday–Friday, 9.30 am to 5.30 pm"
            />
          </p>
          <div className="w-full aspect-[4/3] overflow-hidden md:aspect-auto md:flex-1">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7369.993152959088!2d88.359731!3d22.541801!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02771f12abf9bf%3A0x8cb2f599989f1332!2sWYSIWYG%20Communications%20Private%20Limited!5e0!3m2!1sen!2sus!4v1750420074179!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>

        {/* Right Column - Form */}
        <form className="h-full space-y-8 animate-fadeIn" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold mb-4">
            <EditableText
              keyName="contact.form.heading"
              fallback="Send us a message"
            />
          </h2>

          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Subject <span className="text-red-600">*</span>
            </label>
            <select
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">- Select -</option>
              <option>We'd love you to design for us</option>
              <option>Just Curious</option>
              <option>I'd Love to work at wysiwyg</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Message <span className="text-red-600">*</span>
            </label>
            <textarea
              name="message"
              rows={5}
              required
              value={formData.message}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            ></textarea>
          </div>

          {/* Status message */}
          {status === "success" && (
            <p className="text-green-600">Message sent successfully!</p>
          )}
          {status === "error" && (
            <p className="text-red-600">
              Something went wrong. Please try again.
            </p>
          )}
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
            onChange={handleCaptcha}
          />

          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
