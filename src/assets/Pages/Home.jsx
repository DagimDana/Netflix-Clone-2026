import { useRef, useState } from 'react'
import './Home.css'

const HERO = {
  title: 'MYSTIC REALMS: THE AWAKENING',
  year: '2024',
  rating: 'PG13',
  duration: '2h 48m',
  description:
    'A fantasy epic where an ordinary person discovers they have magical powers and must master them to fight an ancient darkness. Stunning visual effects and immersive world.',
  image:
    'https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg?auto=compress&cs=tinysrgb&w=1600',
}

const ROWS = [
  {
    id: 1,
    title: 'Trending Now',
    movies: [
      { id: 1, title: 'Dark Horizon', image: 'https://images.pexels.com/photos/1547813/pexels-photo-1547813.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 2, title: 'Shadow Protocol', image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 3, title: 'Ocean Drift', image: 'https://images.pexels.com/photos/1591305/pexels-photo-1591305.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 4, title: 'Ember Falls', image: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 5, title: 'Night Runners', image: 'https://images.pexels.com/photos/1122868/pexels-photo-1122868.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 6, title: 'Frozen Peaks', image: 'https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 7, title: 'Iron Crown', image: 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 8, title: 'Desert Storm', image: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=400' },
    ],
  },
  {
    id: 2,
    title: 'Top Picks For You',
    movies: [
      { id: 9, title: 'Stellar Odyssey', image: 'https://images.pexels.com/photos/816608/pexels-photo-816608.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 10, title: 'Blood Moon', image: 'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 11, title: 'The Labyrinth', image: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 12, title: 'Electric Dreams', image: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 13, title: 'Crimson Tide', image: 'https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 14, title: 'The Watcher', image: 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 15, title: 'Jungle Fire', image: 'https://images.pexels.com/photos/2101137/pexels-photo-2101137.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 16, title: 'Quantum Shift', image: 'https://images.pexels.com/photos/355465/pexels-photo-355465.jpeg?auto=compress&cs=tinysrgb&w=400' },
    ],
  },
  {
    id: 3,
    title: 'New Releases',
    movies: [
      { id: 17, title: 'Neon City', image: 'https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 18, title: 'The Last Stand', image: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 19, title: 'Wild Frontier', image: 'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 20, title: 'Under Siege', image: 'https://images.pexels.com/photos/1906658/pexels-photo-1906658.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 21, title: 'Aurora', image: 'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 22, title: 'Phantom Zone', image: 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 23, title: 'Vortex', image: 'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 24, title: 'Red Signal', image: 'https://images.pexels.com/photos/1173777/pexels-photo-1173777.jpeg?auto=compress&cs=tinysrgb&w=400' },
    ],
  },
  {
    id: 4,
    title: 'Action & Adventure',
    movies: [
      { id: 25, title: 'Breakout', image: 'https://images.pexels.com/photos/1569012/pexels-photo-1569012.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 26, title: 'Fire & Ice', image: 'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 27, title: 'Rogue Agent', image: 'https://images.pexels.com/photos/3621344/pexels-photo-3621344.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 28, title: 'Skyfall', image: 'https://images.pexels.com/photos/1308881/pexels-photo-1308881.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 29, title: 'Colossus', image: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 30, title: 'Ghost Hunt', image: 'https://images.pexels.com/photos/1482193/pexels-photo-1482193.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 31, title: 'Blade Runner', image: 'https://images.pexels.com/photos/2129796/pexels-photo-2129796.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 32, title: 'Titan Rising', image: 'https://images.pexels.com/photos/1448055/pexels-photo-1448055.jpeg?auto=compress&cs=tinysrgb&w=400' },
    ],
  },
]

function MovieCard({ movie }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`movie-card ${hovered ? 'movie-card--hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img src={movie.image} alt={movie.title} className="movie-card__img" />
      {hovered && (
        <div className="movie-card__overlay">
          <p className="movie-card__title">{movie.title}</p>
          <div className="movie-card__actions">
            <button className="movie-card__play">
              <svg viewBox="0 0 24 24" fill="black" width="14" height="14">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button className="movie-card__add">+</button>
            <button className="movie-card__like">
              <svg viewBox="0 0 24 24" fill="white" width="14" height="14">
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MovieRow({ row }) {
  const sliderRef = useRef(null)

  const scroll = (direction) => {
    const slider = sliderRef.current
    if (slider) {
      slider.scrollBy({ left: direction * 800, behavior: 'smooth' })
    }
  }

  return (
    <section className="movie-row">
      <h2 className="movie-row__title">{row.title}</h2>
      <div className="movie-row__wrapper">
        <button className="movie-row__arrow movie-row__arrow--left" onClick={() => scroll(-1)}>
          &#8249;
        </button>
        <div className="movie-row__slider" ref={sliderRef}>
          {row.movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
        <button className="movie-row__arrow movie-row__arrow--right" onClick={() => scroll(1)}>
          &#8250;
        </button>
      </div>
    </section>
  )
}

function Home() {
  return (
    <main className="home">
      <section
        className="hero"
        style={{ backgroundImage: `url(${HERO.image})` }}
      >
        <div className="hero__gradient" />
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-label">
              <span className="hero__badge-top">TOP</span>
              <span className="hero__badge-num">10</span>
            </span>
            <span className="hero__badge-text">#1 IN MOVIES TODAY</span>
          </div>
          <h1 className="hero__title">{HERO.title}</h1>
          <div className="hero__meta">
            <span className="hero__year">{HERO.year}</span>
            <span className="hero__rating">{HERO.rating}</span>
            <span className="hero__duration">{HERO.duration}</span>
          </div>
          <p className="hero__description">{HERO.description}</p>
          <div className="hero__buttons">
            <button className="hero__btn hero__btn--play">
              <svg viewBox="0 0 24 24" fill="black" width="18" height="18">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </button>
            <button className="hero__btn hero__btn--info">
              <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              More Info
            </button>
          </div>
        </div>
        <div className="hero__bottom-fade" />
      </section>

      <div className="home__rows">
        {ROWS.map((row) => (
          <MovieRow key={row.id} row={row} />
        ))}
      </div>
    </main>
  )
}

export default Home
