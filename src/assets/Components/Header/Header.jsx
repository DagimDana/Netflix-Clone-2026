import { useState, useEffect } from 'react'
import './Header.css'

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__left">
        <div className="header__logo">NETFLIX</div>
        <nav className="header__nav">
          <a href="#" className="header__nav-link header__nav-link--active">Home</a>
          <a href="#" className="header__nav-link">TV Shows</a>
          <a href="#" className="header__nav-link">Movies</a>
          <a href="#" className="header__nav-link">New &amp; Popular</a>
          <a href="#" className="header__nav-link">My List</a>
        </nav>
      </div>
      <div className="header__right">
        <div className={`header__search ${searchOpen ? 'header__search--open' : ''}`}>
          <button
            className="header__icon-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
          {searchOpen && (
            <input
              className="header__search-input"
              type="text"
              placeholder="Titles, people, genres"
              autoFocus
            />
          )}
        </div>
        <button className="header__login-btn">Login</button>
      </div>
    </header>
  )
}

export default Header
