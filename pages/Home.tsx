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
    eyebrow: "Poolside ease",
    title: "A relaxed corner of the property.",
    description: "Settle into an open-air pause, cool off, or simply let the afternoon move at its own pace.",
    image: "https://res.cloudinary.com/dxryndnhl/image/upload/v1779385271/Screenshot_2026-05-20_at_6.26.14_pm_rnngx3.png",
    imageAlt: "Poolside seating at Moore Hotels",
    to: "/services",
    action: "Explore poolside",
  },
  {
    eyebrow: "Games & connection",
    title: "A little room for friendly competition.",
    description: "An easy-going games corner for conversation, connection, and unplanned moments between guests.",
    image: "https://res.cloudinary.com/dxryndnhl/image/upload/v1785697853/Screenshot_2026-08-02_at_8.10.42_pm_ybmndu.png",
    imageAlt: "Pool table in the Moore Hotels games area",
    to: "/services",
    action: "See leisure spaces",
  },
  {
    eyebrow: "Open-air lounge",
    title: "Quiet seats above the day.",
    description: "A sheltered outdoor setting for a private conversation, a clear thought, or a slower evening.",
    image: "https://res.cloudinary.com/dxryndnhl/image/upload/v1785694158/Screenshot_2026-08-02_at_7.09.12_pm_yyiwwl.png",
    imageAlt: "Covered lounge seating at Moore Hotels",
    to: "/about",
    action: "Discover the property",
  },
];

const powerSystems = [
  {
    icon: "electric_bolt",
    eyebrow: "Generator house",
    title: "Backup power, ready when needed.",
    description: "Dedicated generation supports essential hotel operations whenever public supply is interrupted.",
    details: ["Dedicated backup generation", "Essential guest areas prioritised"],
    image: "https://res.cloudinary.com/dxryndnhl/image/upload/v1785694392/Screenshot_2026-08-02_at_7.13.04_pm_xpzvmg.png",
  },
  {
    icon: "solar_power",
    eyebrow: "Solar & inverter room",
    title: "A quieter layer of resilience.",
    description: "Solar storage and inverter support help smooth supply transitions and reduce unnecessary generator runtime.",
    details: ["Solar-supported energy storage", "Managed power transitions"],
    image: "https://res.cloudinary.com/dxryndnhl/image/upload/v1785694330/Screenshot_2026-08-02_at_7.12.03_pm_fu9faq.png",
  },
];

const premisesSpaces = [
  {
    icon: "meeting_room",
    eyebrow: "Room approaches",
    title: "Upper-floor corridors",
    description: "Bright, composed walkways create a quiet transition from the shared hotel spaces to your room.",
    to: "/about",
    action: "View our story",
    image: "/Images/premises/upstairs-corridor.jpg",
    imageSlot: "https://res.cloudinary.com/dxryndnhl/image/upload/v1785702977/Screenshot_2026-08-02_at_9.35.56_pm_ynyuh0.png",
  },
  {
    icon: "stairs",
    eyebrow: "Movement through Moore",
    title: "Stairways & landings",
    description: "Detailed railings, warm finishes, and considered lighting carry the hotel character between floors.",
    to: "/about",
    action: "Explore the property",
    image: "/Images/premises/stairway-landing.jpg",
    imageSlot: "https://res.cloudinary.com/dxryndnhl/image/upload/v1785703020/Screenshot_2026-08-02_at_9.36.33_pm_tq31t5.png",
  },
  {
    icon: "weekend",
    eyebrow: "Shared upstairs space",
    title: "Upstairs lounge",
    description: "A more private common area gives families and small groups room to sit, talk, and settle in together.",
    to: "/services",
    action: "See guest spaces",
    image: "/Images/premises/upstairs-lounge.jpg",
    imageSlot: "/Images/premises/upstairs-lounge.jpg",
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
            src="https://res.cloudinary.com/dxryndnhl/image/upload/v1785699735/Screenshot_2026-08-02_at_8.42.08_pm_plc96z.png"
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
              Rest well, recharge fully, and experience thoughtful Nigerian hospitality along the Sagamu–Ikenne corridor.
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
              src="https://res.cloudinary.com/dxryndnhl/image/upload/v1785699634/Screenshot_2026-08-02_at_8.39.54_pm_rggvsx.png"
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
            <p className="ui-copy max-w-xl md:justify-self-end">Poolside pauses, shared games, and open-air seating give every stay more room to unfold.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-12 xl:grid-rows-2">
            {discoverMore.map((item, index) => (
              <Link
                key={item.title}
                to={item.to}
                className={`group relative min-h-[24rem] overflow-hidden rounded-lg border border-white/10 bg-surface-dark shadow-2xl ${index === 0 ? "md:col-span-2 xl:col-span-7 xl:row-span-2 xl:min-h-[43rem]" : "xl:col-span-5 xl:min-h-[20rem]"}`}
              >
                <img src={item.image} alt={item.imageAlt} className="image-luxury absolute inset-0 h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/5" />
                <div className="absolute inset-0 border border-white/0 transition-colors duration-500 group-hover:border-primary/35" aria-hidden="true" />
                <div className={`absolute inset-x-0 bottom-0 p-6 sm:p-8 ${index === 0 ? "xl:p-10" : ""}`}>
                  <p className="ui-eyebrow">{item.eyebrow}</p>
                  <h3 className={`font-display mt-3 italic leading-[1.12] text-white ${index === 0 ? "text-[clamp(2rem,3.3vw,3.25rem)]" : "text-[clamp(1.6rem,2.2vw,2.15rem)]"}`}>{item.title}</h3>
                  <p className={`mt-4 max-w-lg text-sm leading-7 text-gray-300 ${index === 0 ? "" : "xl:hidden 2xl:block"}`}>{item.description}</p>
                  <span className="mt-6 inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors group-hover:text-primary">{item.action}<span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">arrow_forward</span></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="ui-section border-y border-white/5 bg-[#0b0b0b]" aria-labelledby="power-infrastructure-title">
        <div className="ui-container-wide grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:col-span-4">
            <p className="ui-eyebrow">Behind the comfort</p>
            <h2 id="power-infrastructure-title" className="ui-section-title mt-4 italic text-white">Power that stays in the background.</h2>
            <p className="ui-copy mt-5">A layered power setup helps rooms, shared spaces, and essential hotel operations remain dependable through changes in public supply.</p>
            <div className="mt-8 flex items-start gap-3 border-t border-white/10 pt-6 text-sm leading-6 text-gray-400">
              <span className="material-symbols-outlined mt-0.5 text-primary" aria-hidden="true">monitor_heart</span>
              <span>Hotel operations monitor supply changes and coordinate the available power sources.</span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
            {powerSystems.map((system, index) => (
              <article key={system.title} className="group relative min-h-[27rem] overflow-hidden rounded-lg border border-white/10 bg-[#111] p-6 shadow-2xl sm:p-8">
                <img src={system.image} alt="" className="image-luxury pointer-events-none absolute inset-0 h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-75" loading="lazy" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" aria-hidden="true" />
                <div className={`pointer-events-none absolute inset-0 opacity-80 ${index === 0 ? "bg-[radial-gradient(circle_at_80%_15%,rgba(201,74,17,0.22),transparent_38%)]" : "bg-[radial-gradient(circle_at_75%_10%,rgba(229,192,104,0.18),transparent_40%)]"}`} aria-hidden="true" />
                <div className="pointer-events-none absolute -right-16 top-16 size-56 rounded-full border border-white/[0.06] transition-transform duration-700 group-hover:scale-110" aria-hidden="true" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-14 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary"><span className="material-symbols-outlined text-3xl" aria-hidden="true">{system.icon}</span></span>
                  </div>
                  <div className="mt-auto pt-20">
                    <p className="ui-eyebrow">{system.eyebrow}</p>
                    <h3 className="font-display mt-3 text-[clamp(1.75rem,2.4vw,2.4rem)] italic leading-[1.1] text-white">{system.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-gray-400">{system.description}</p>
                    <ul className="mt-6 space-y-3 border-t border-white/10 pt-5" aria-label={`${system.eyebrow} details`}>
                      {system.details.map((detail) => <li key={detail} className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.09em] text-gray-300"><span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />{detail}</li>)}
                    </ul>
                  </div>
                </div>
              </article>
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

      <section className="ui-section" aria-labelledby="premises-spaces-title">
        <div className="ui-container-wide">
          <div className="grid gap-6 border-b border-white/10 pb-9 md:grid-cols-2 md:items-end">
            <div>
              <p className="ui-eyebrow">Around the premises</p>
              <h2 id="premises-spaces-title" className="ui-section-title mt-4 italic text-white">The spaces between your room matter.</h2>
            </div>
            <p className="ui-copy max-w-xl md:justify-self-end">From the upstairs approach to the shared lounge, each part of the property helps the hotel feel considered and complete.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {premisesSpaces.map((space) => (
              <Link key={space.title} to={space.to} data-image-slot={space.imageSlot} className="group overflow-hidden rounded-lg border border-white/10 bg-[#101010] shadow-2xl transition-colors duration-300 hover:border-primary/35">
                <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_75%_20%,rgba(201,74,17,.16),transparent_38%),linear-gradient(145deg,#171717,#0c0c0c)]">
                  {space.image ? (
                    <img src={space.image} alt={`${space.title} at Moore Hotels`} className="image-luxury absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" loading="lazy" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
                      <span className="material-symbols-outlined text-[4.5rem] font-light text-white/[0.08] transition duration-500 group-hover:scale-110 group-hover:text-primary/20">{space.icon}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="ui-eyebrow">{space.eyebrow}</p>
                  </div>
                </div>
                <div className="p-6 sm:p-7">
                  <h3 className="font-display text-[clamp(1.6rem,2.2vw,2rem)] italic leading-tight text-white">{space.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-gray-500">{space.description}</p>
                  <span className="mt-6 inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.11em] text-white transition-colors group-hover:text-primary">{space.action}<span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">arrow_forward</span></span>
                </div>
              </Link>
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
              src="https://res.cloudinary.com/dxryndnhl/video/upload/v1785696570/IMG_1221_jtnwy1.mov"
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
              src="https://res.cloudinary.com/dxryndnhl/image/upload/v1785699796/Screenshot_2026-08-02_at_8.42.45_pm_bklvqu.png"
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
