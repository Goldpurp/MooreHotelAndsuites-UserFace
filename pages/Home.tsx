import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { Room, RoomCategory } from "../types";
import FAQ from "../components/FAQ";
import NotificationModal from "../components/NotificationModal";
import { addDaysToInput, todayInputValue } from "../utils/dates";
import RoomCard from "../components/RoomCard";

const stayAssurances = [
  { icon: "support_agent", title: "24-hour reception", text: "Assistance with arrivals, departures, and guest requests at every hour." },
  { icon: "wifi", title: "Hotel-wide Wi-Fi", text: "Complimentary connectivity for work, calls, streaming, and everyday plans." },
  { icon: "bolt", title: "Resilient power", text: "Generator and inverter support designed for dependable round-the-clock comfort." },
  { icon: "local_parking", title: "Secure parking", text: "Convenient on-site parking with monitored access for resident guests." },
];

const discoverMore = [
  {
    eyebrow: "Dining at Moore",
    title: "Flavour for every part of the day.",
    description: "Move from relaxed breakfast to considered dinners, lounge plates, and a quiet evening drink.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=84&w=1600",
    imageAlt: "A composed table of local and continental dishes",
    to: "/dining",
    action: "Explore dining",
  },
  {
    eyebrow: "Guest services",
    title: "Thoughtful support, always close.",
    description: "From reception and room dining to wellness, recreation, and garment care, the details are handled.",
    image: "/Images/WellnessAndSanctuary.jpg",
    imageAlt: "Wellness and guest services at Moore Hotels",
    to: "/services",
    action: "View guest services",
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [searching, setSearching] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [modal, setModal] = useState<{ show: boolean; title: string; message: string; type: "success" | "error" | "info" }>({
    show: false,
    title: "",
    message: "",
    type: "info",
  });
  const [searchData, setSearchData] = useState({
    category: "All",
    checkIn: todayInputValue(),
    checkOut: addDaysToInput(todayInputValue(), 1),
    guests: "2",
  });

  const { data: featuredRooms = [], isLoading, error, refetch } = useQuery<Room[], Error>({
    queryKey: ["featuredRooms"],
    queryFn: async () => (await api.getRooms()).slice(0, 4),
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });

  const buildSearchParams = () => {
    const params = new URLSearchParams();
    if (searchData.category !== "All") params.set("category", searchData.category);
    params.set("checkIn", searchData.checkIn);
    params.set("checkOut", searchData.checkOut);
    params.set("guests", searchData.guests);
    return params;
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchData.checkIn < todayInputValue() || searchData.checkOut <= searchData.checkIn) {
      setModal({
        show: true,
        title: "Check your dates",
        message: "Check-in cannot be in the past, and check-out must be after check-in.",
        type: "error",
      });
      return;
    }
    setSearching(true);
    window.setTimeout(() => navigate(`/rooms?${buildSearchParams().toString()}`), 250);
  };

  const toggleVideo = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play();
      setVideoPlaying(true);
    } else {
      video.pause();
      setVideoPlaying(false);
    }
  };

  if (error && featuredRooms.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background-dark p-6 text-center">
        <span className="grid size-16 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-3xl" aria-hidden="true">cloud_off</span>
        </span>
        <div>
          <h1 className="ui-page-title italic text-white">We could not load the hotel</h1>
          <p className="ui-copy mx-auto mt-4 max-w-md">Check your connection and try again. Your dates and guest details have not been changed.</p>
        </div>
        <button onClick={() => refetch()} className="ui-button ui-button-primary">Try again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark">
      <NotificationModal
        isOpen={modal.show}
        onClose={() => setModal((current) => ({ ...current, show: false }))}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      <header className="relative flex min-h-[46rem] items-center overflow-hidden px-4 pb-16 pt-32 text-center sm:px-6 lg:min-h-[50rem]">
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/dxryndnhl/image/upload/v1779385270/Screenshot_2026-05-20_at_6.26.38_pm_r2vt5e.png"
            alt="Moore Hotels & Suites exterior"
            className="h-full w-full scale-[1.03] object-cover opacity-75 image-luxury"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/35 to-background-dark" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,.38)_78%)]" />
        </div>

        <div className="ui-container relative z-10">
          <div className="mx-auto max-w-4xl">
            <p className="ui-eyebrow flex items-center justify-center gap-4 before:h-px before:w-8 before:bg-primary/60 after:h-px after:w-8 after:bg-primary/60">
              Four-star hospitality in Sagamu
            </p>
            <h1 className="ui-display mt-6 text-white">
              The standard of <span className="italic text-primary">luxury</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[clamp(1rem,2vw,1.18rem)] leading-8 text-gray-200/85">
              Rest well, dine beautifully, and experience thoughtful Nigerian hospitality along the Sagamu–Ikenne corridor.
            </p>
          </div>

          <form onSubmit={handleSearch} className="ui-card mx-auto mt-10 max-w-6xl overflow-hidden bg-black/55 p-2 text-left backdrop-blur-xl" aria-label="Search available rooms">
            <div className="grid md:grid-cols-2 xl:grid-cols-[1.05fr_1fr_1fr_.75fr_auto]">
              <label className="border-b border-white/10 px-4 py-3 md:border-r xl:border-b-0">
                <span className="ui-label mb-1.5">Room type</span>
                <select
                  value={searchData.category}
                  onChange={(event) => setSearchData({ ...searchData, category: event.target.value })}
                  className="min-h-10 w-full cursor-pointer appearance-none bg-transparent text-sm font-semibold text-white outline-none"
                >
                  <option className="bg-black" value="All">All rooms</option>
                  {Object.values(RoomCategory).map((category) => <option key={category} className="bg-black" value={category}>{category}</option>)}
                </select>
              </label>
              <label className="border-b border-white/10 px-4 py-3 xl:border-b-0 xl:border-r">
                <span className="ui-label mb-1.5">Check-in</span>
                <input
                  type="date"
                  min={todayInputValue()}
                  value={searchData.checkIn}
                  onChange={(event) => {
                    const checkIn = event.target.value;
                    setSearchData((current) => ({
                      ...current,
                      checkIn,
                      checkOut: current.checkOut <= checkIn ? addDaysToInput(checkIn, 1) : current.checkOut,
                    }));
                  }}
                  className="min-h-10 w-full bg-transparent text-sm font-semibold text-white outline-none"
                />
              </label>
              <label className="border-b border-white/10 px-4 py-3 md:border-r xl:border-b-0">
                <span className="ui-label mb-1.5">Check-out</span>
                <input
                  type="date"
                  min={searchData.checkIn || todayInputValue()}
                  value={searchData.checkOut}
                  onChange={(event) => setSearchData({ ...searchData, checkOut: event.target.value })}
                  className="min-h-10 w-full bg-transparent text-sm font-semibold text-white outline-none"
                />
              </label>
              <label className="border-b border-white/10 px-4 py-3 xl:border-b-0 xl:border-r">
                <span className="ui-label mb-1.5">Guests</span>
                <select
                  value={searchData.guests}
                  onChange={(event) => setSearchData({ ...searchData, guests: event.target.value })}
                  className="min-h-10 w-full cursor-pointer appearance-none bg-transparent text-sm font-semibold text-white outline-none"
                >
                  {[1, 2, 3, 4].map((count) => <option key={count} className="bg-black" value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}
                </select>
              </label>
              <button type="submit" disabled={searching} className="ui-button ui-button-primary m-2 min-h-14 px-7">
                {searching && <span className="material-symbols-outlined animate-spin" aria-hidden="true">progress_activity</span>}
                {searching ? "Searching" : "Check rooms"}
              </button>
            </div>
          </form>
        </div>
      </header>

      <section className="ui-section">
        <div className="ui-container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <p className="ui-eyebrow">Nigerian professionalism</p>
            <h2 className="ui-section-title mt-4 italic text-white">Refined hotel service at every touchpoint.</h2>
            <p className="ui-copy mt-6 max-w-xl">
              Moore Hotels &amp; Suites blends modern standards with genuine local warmth. From arrival to departure, every detail is designed to make your stay calm, efficient, and memorable.
            </p>
            <Link to="/about" className="ui-button ui-button-secondary mt-8">Discover our story <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span></Link>
          </div>
          <div className="group order-1 overflow-hidden rounded-lg border border-white/10 shadow-2xl lg:order-2">
            <img
              src="https://res.cloudinary.com/dxryndnhl/image/upload/v1779385271/Screenshot_2026-05-20_at_6.26.14_pm_rnngx3.png"
              alt="Exterior of Moore Hotels & Suites in Sagamu"
              className="image-luxury aspect-[4/3] h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="ui-section border-y border-white/5 bg-surface-dark/45">
        <div className="ui-container-wide">
          <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="ui-eyebrow">Stay your way</p>
              <h2 className="ui-section-title mt-3 italic text-white">Featured rooms</h2>
            </div>
            <Link to="/rooms" className="ui-button ui-button-secondary">View all rooms <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span></Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? [1, 2, 3, 4].map((item) => <div key={item} className="aspect-[4/5] animate-pulse rounded-lg bg-white/[0.04]" />)
              : featuredRooms.map((room, index) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    to={`/rooms/${room.id}?${buildSearchParams().toString()}`}
                    variant="featured"
                    eager={index === 0}
                  />
                ))}
          </div>
        </div>
      </section>

      <section className="ui-section">
        <div className="ui-container-wide">
          <div className="mb-10 grid gap-5 md:grid-cols-2 md:items-end">
            <div>
              <p className="ui-eyebrow">Beyond your room</p>
              <h2 className="ui-section-title mt-4 italic text-white">More of Moore to discover.</h2>
            </div>
            <p className="ui-copy max-w-xl md:justify-self-end">Dining, leisure, and attentive service come together so your time with us feels complete—not simply accommodated.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {discoverMore.map((item) => (
              <Link key={item.title} to={item.to} className="group relative min-h-[30rem] overflow-hidden rounded-lg border border-white/10 bg-surface-dark shadow-2xl sm:min-h-[34rem]">
                <img src={item.image} alt={item.imageAlt} className="image-luxury absolute inset-0 h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                  <p className="ui-eyebrow">{item.eyebrow}</p>
                  <h3 className="ui-section-title mt-3 max-w-xl italic text-white">{item.title}</h3>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-gray-300">{item.description}</p>
                  <span className="mt-6 inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors group-hover:text-primary">{item.action}<span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">arrow_forward</span></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-black/50 py-16 sm:py-20" aria-labelledby="stay-assurances-title">
        <div className="ui-container-wide">
          <div className="max-w-2xl">
            <p className="ui-eyebrow">Included in your stay</p>
            <h2 id="stay-assurances-title" className="ui-section-title mt-4 italic text-white">The practical details are already considered.</h2>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {stayAssurances.map((item) => (
              <article key={item.title} className="group bg-[#101010] p-6 transition-colors duration-300 hover:bg-[#151515] sm:p-7">
                <span className="grid size-11 place-items-center rounded-full border border-primary/25 bg-primary/10 text-primary transition-transform duration-300 group-hover:-translate-y-1"><span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span></span>
                <h3 className="mt-5 text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-500">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ui-section bg-black">
        <div className="ui-container grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="ui-eyebrow">The Moore experience</p>
            <h2 className="ui-section-title mt-4 italic text-white">A calm retreat, made personal.</h2>
            <p className="ui-copy mt-5">See the atmosphere, spaces, and service that shape every stay.</p>
            <button type="button" onClick={toggleVideo} className="ui-button ui-button-secondary mt-8" aria-pressed={videoPlaying}>
              <span className="material-symbols-outlined" aria-hidden="true">{videoPlaying ? "pause" : "play_arrow"}</span>
              {videoPlaying ? "Pause film" : "Play film"}
            </button>
          </div>
          <div className="group overflow-hidden rounded-lg border border-white/10 shadow-[0_35px_80px_rgba(0,0,0,.55)] lg:col-span-8">
            <video
              ref={videoRef}
              src="https://media.istockphoto.com/id/2164324479/video/calm-summer-evening-in-luxury-hotel-woman-lying-on-lounger-put-hands-back-silhouette-of-lady.mp4?s=mp4-640x640-is&k=20&c=mmsIo19OMUfPZ-wUsNdTNZXzVOCY524vS-3Ek9zLPGI="
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="image-luxury aspect-video h-full w-full object-cover"
              aria-label="Moore Hotels atmosphere film"
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
            />
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-black py-16 text-center sm:py-20">
        <blockquote className="ui-container max-w-4xl">
          <span className="material-symbols-outlined text-5xl text-primary/50" aria-hidden="true">format_quote</span>
          <p className="font-display mt-4 text-[clamp(1.65rem,4vw,3.2rem)] italic leading-[1.3] text-white">Every guest experience is handled with professional precision and Nigerian warmth.</p>
          <footer className="ui-eyebrow mt-6">Alase Moore</footer>
        </blockquote>
      </section>

      <section className="ui-section">
        <div className="ui-container-wide grid overflow-hidden rounded-lg border border-white/10 bg-surface-dark/70 shadow-2xl lg:grid-cols-12">
          <div className="group relative min-h-[24rem] overflow-hidden lg:col-span-7 lg:min-h-[34rem]">
            <img
              src="https://res.cloudinary.com/dxryndnhl/image/upload/v1779385271/Screenshot_2026-05-20_at_6.26.14_pm_rnngx3.png"
              alt="Moore Hotels & Suites in Sagamu"
              className="image-luxury absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 rounded border border-white/10 bg-black/70 px-4 py-3 text-sm text-white backdrop-blur-lg sm:bottom-7 sm:left-7">
              <span className="material-symbols-outlined mr-2 text-primary" aria-hidden="true">location_on</span>
              Sagamu, Ogun State
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-9 lg:col-span-5 lg:p-12">
            <p className="ui-eyebrow">Location &amp; arrival</p>
            <h2 className="ui-section-title mt-4 italic text-white">Well placed for an easy stay.</h2>
            <p className="ui-copy mt-5">Find us on the Sagamu–Ikenne Road, beside the NYSC Camp—a practical base for business, events, family visits, and quiet weekends.</p>

            <address className="mt-7 flex items-start gap-3 border-y border-white/10 py-5 text-sm not-italic leading-7 text-gray-300">
              <span className="material-symbols-outlined mt-1 text-primary" aria-hidden="true">pin_drop</span>
              <span>Harmony Estate, Sagamu–Ikenne Road, beside NYSC Camp, Sagamu, Ogun State</span>
            </address>

            <dl className="mt-6 grid grid-cols-2 gap-5 text-sm">
              <div><dt className="ui-label">Check-in</dt><dd className="font-semibold text-white">From 2:00 pm</dd></div>
              <div><dt className="ui-label">Check-out</dt><dd className="font-semibold text-white">By 12:00 pm</dd></div>
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a href="https://maps.google.com/?q=Harmony+Estate+Sagamu+Ikenne+Road+Ogun+State+Nigeria" target="_blank" rel="noopener noreferrer" className="ui-button ui-button-primary">Get directions <span className="material-symbols-outlined text-lg" aria-hidden="true">near_me</span></a>
              <a href="tel:+2348033774544" className="ui-button ui-button-secondary">Call the hotel <span className="material-symbols-outlined text-lg" aria-hidden="true">call</span></a>
            </div>
          </div>
        </div>
      </section>

      <FAQ />

      <section className="ui-section text-center">
        <div className="ui-container max-w-3xl">
          <p className="ui-eyebrow">Guest relations</p>
          <h2 className="ui-section-title mt-4 italic text-white">Plan your next stay.</h2>
          <p className="ui-copy mx-auto mt-5 max-w-2xl">Speak with our team about corporate rates, events, and tailored stays.</p>
          <a href="mailto:info@moorehotelandsuites.com?subject=Stay%20Enquiry" className="ui-button ui-button-primary mt-8">Email guest relations</a>
        </div>
      </section>
    </div>
  );
};

export default Home;
